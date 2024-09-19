const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { default: axios } = require('axios');
const nodemailer = require('nodemailer');
const PasswordReset = require('../models/PasswordReset');
const crypto = require('crypto');

const GOOGLE_RECAPTCHA_SECRET_KEY = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;

exports.signup = [
  body('firstName').trim().notEmpty().escape(),
  body('lastName').trim().notEmpty().escape(),
  body('email')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Invalid Email')
    .normalizeEmail({ all_lowercase: true }),
  body('password').trim().notEmpty(),

  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    bcryptjs.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        res.send(err);
        return;
      }
      try {
        const { recaptcha } = req.body;
        const response = await axios.post(
          'https://www.google.com/recaptcha/api/siteverify',
          null,
          {
            params: {
              secret: GOOGLE_RECAPTCHA_SECRET_KEY,
              response: recaptcha,
            },
          }
        );
        const { success } = response.data;
        if (!success) {
          return res
            .status(400)
            .json({ message: 'reCAPTCHA verification failed' });
        }
        const user = new User({
          email: req.body.email,
          password: hashedPassword,
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          googleId: req.body.googleId || undefined,
        });
        await user.save();
        req.login(user, (err) => {
          if (err) {
            return res.status(500).send({ error: 'error logging in', err });
          } else {
            const body = {
              id: user._id,
              email: user.email,
            };
            const token = jwt.sign(body, process.env.SECRET);
            return res
              .status(200)
              .json({ message: 'User created', user, token });
          }
        });
      } catch (err) {
        if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
          return res.status(400).json({ message: 'Email already exists' });
        }
        console.log(err);
        return res.status(500).json({ error: 'Something went wrong' });
      }
    });
  },
];

exports.login = [
  body('email')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Invalid Email')
    .normalizeEmail({ all_lowercase: true }),

  body('password').trim().notEmpty(),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }
    const { email, password, recaptcha } = req.body;

    try {
      const response = await axios.post(
        'https://www.google.com/recaptcha/api/siteverify',
        null,
        {
          params: {
            secret: GOOGLE_RECAPTCHA_SECRET_KEY,
            response: recaptcha,
          },
        }
      );

      const { success } = response.data;
      if (!success) {
        return res
          .status(400)
          .json({ message: 'reCAPTCHA verification failed' });
      }
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      const matched = await bcryptjs.compare(password, user.password);
      if (!matched) {
        return res.status(401).json({ message: 'Wrong password' });
      }
      const payload = {
        id: user._id,
        email: user.email,
      };
      const token = jwt.sign(payload, process.env.SECRET);
      return res.status(200).json({ payload, token });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Something went wrong' });
    }
  },
];

exports.logout = async (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.status(200).json({ message: 'Successfully logged out' });
  });
};

exports.googleSignup = (req, res) => {
  const user = req.user;
  const payload = {
    id: user.id,
    email: user.email,
  };
  const token = jwt.sign(payload, process.env.SECRET);
  console.log(token, payload);
  res.redirect(`http://localhost:3000?token=${token}`);
};

exports.requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 60 * 60 * 2 * 1000; //2 hours

    const token = new PasswordReset({
      userId: user._id,
      resetToken,
      expiresAt,
    });
    await token.save();
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_PASSWORD,
      },
    });
    const mailOptions = {
      to: email,
      from: 'no-reply@satyamagrawal.com',
      subject: 'Password Reset Request for Muta Engine Web App',
      text: `You requested a password reset. Click the link to reset your password: http://localhost:3000/password-reset?resetToken=${resetToken}`,
    };
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Password reset mail sent' });
  } catch (err) {
    res.staus(500).json({ error: 'Internal Server Error' });
  }
};

exports.resetPassword = async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    const resetTokenEntry = await PasswordReset.findOne({ resetToken });
    console.log(resetTokenEntry, resetToken);
    if (!resetTokenEntry || resetTokenEntry.expiresAt < Date.now()) {
      console.log("here1")
      return res.status(400).json({ message: 'Invalid or Expired token' });
    }
    const user = await User.findById(resetTokenEntry.userId);
    if (!user) {
      console.log("here2");
      return res.status(400).json({ message: 'User not found' });
    }
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    return res.status(200).json({ message: 'Password was reset successfully' });
  } catch (err) {
    res.send(500).json({ err: 'Internal Server Error' });
  }
};
