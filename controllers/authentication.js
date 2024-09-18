const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/Users');

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
              _id: user._id,
              email: user.email,
            };
            const token = jwt.sign({ user: body }, process.env.SECRET);
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
