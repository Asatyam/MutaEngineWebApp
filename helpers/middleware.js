const passport = require('passport');

exports.ensureAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ message: 'Unauthorized to Perform this action' });
    req.user = user;
    next();
  })(req, res, next);
};
