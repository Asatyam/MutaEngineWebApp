const passport = require('passport');
const logger = require('./logger');
const fs = require('fs');
const path = require('path');

exports.ensureAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err) return next(err);
    if (!user)
      return res
        .status(401)
        .json({ message: 'Unauthorized to Perform this action' });
    req.user = user;
    next();
  })(req, res, next);
};

exports.logging = (req, res, next) => {
  const currentTime = new Date().toISOString();

  const relevantHeaders = [
    'host',
    'user-agent',
    'content-type',
    'authorization',
  ];

  const filteredHeaders = {};
  relevantHeaders.forEach((header) => {
    if (req.headers[header]) {
      filteredHeaders[header] = req.headers[header];
    }
  });

  const logDetails = {
    timestamp: currentTime,
    method: req.method,
    url: req.originalUrl,
    headers: filteredHeaders,
  };

  logger.info('Incoming Request:', logDetails);

  res.on('finish', () => {
    const responseLog = {
      timestamp: currentTime,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
    };
    logger.info('Outgoing Response:', responseLog);
  });

  next();
};

const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
const apiUsage = {};
const logFilePath = path.join(logsDir, 'apiUsage.log');

exports.trackApiUsage = (req, res, next) => {
  const key = `${req.method} ${req.originalUrl}`;
  const currentTime = new Date().toISOString();

  if (!apiUsage[key]) {
    apiUsage[key] = {
      count: 0,
      lastAccessed: null,
    };
  }

  apiUsage[key].count += 1;
  apiUsage[key].lastAccessed = currentTime;

  console.log(
    `API Usage: ${key} has been accessed ${apiUsage[key].count} times. Last accessed at: ${currentTime}`
  );

  const logMessage = `API Usage: ${key} - Count: ${apiUsage[key].count} - Last Accessed: ${currentTime}\n`;

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('Error writing to log file:', err);
    }
  });

  next();
};
