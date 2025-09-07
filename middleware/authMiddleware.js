const jwt = require('jsonwebtoken');
const User = require('../models/User');

// This function is our "guard" for protected routes.
const protect = async (req, res, next) => {
  let token;

  // The token is usually sent in the 'Authorization' header, formatted as "Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // 1. Extract the token from the header
      token = req.headers.authorization.split(' ')[1];

      // 2. Verify the token using our secret key from the .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Use the user ID from the token to find the user in the database.
      // We exclude the password from being returned for security.
      req.user = await User.findById(decoded.id).select('-password');

      // 4. If everything is successful, proceed to the next function in the chain (the actual controller logic).
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // If no token is found in the header, deny access.
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };

