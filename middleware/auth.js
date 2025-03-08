const jwt = require('jsonwebtoken');

// Middleware to authenticate the JWT
module.exports = function(req, res, next) {
  // Get token from the request header
  const token = req.header('x-auth-token');

  // Check if token is not provided
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Try to verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;  // Attach user information to the request object
    next();  // Proceed to the next middleware or route handler
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};