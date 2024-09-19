const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { default: axios } = require('axios');

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
  res.redirect(`http://localhost:3000?${token}`);
};
