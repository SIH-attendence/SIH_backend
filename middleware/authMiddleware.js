import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * @desc    Protect routes from unauthorized access
 * @route   Middleware function
 */
const protect = async (req, res, next) => {
  let token;

  // Read the JWT from the 'Authorization' header.
  // It should be in the format "Bearer [token]".
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header (split "Bearer" and the token string)
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key from our .env file
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user associated with the token's ID in the database.
      // We exclude the password from the data we fetch.
      req.user = await User.findById(decoded.id).select('-password');

      // If the user is found, proceed to the next function in the chain (the controller).
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      res.status(401); // 401 Unauthorized
      throw new Error('Not authorized, token failed');
    }
  }

  // If there's no token at all, block access.
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
};

export { protect };

