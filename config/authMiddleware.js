// Import the jsonwebtoken library
const jwt = require('jsonwebtoken');

// Define the authMiddleware function that will serve as a middleware for protected routes
const authMiddleware = (req, res, next) => {
  // Get the access token from the cookies of the incoming request
  const accessTokenFromCookie = req.cookies.accessToken;
  
  // Get the access token from the Authorization header of the incoming request
  const authHeader = req.headers.authorization;
  const accessTokenFromHeader = authHeader && authHeader.split(' ')[1];

  // Use the access token from either the Cookie header or the Authorization header
  const accessToken = accessTokenFromCookie || accessTokenFromHeader;

  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
    if (err) {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      next();
    }
  });
};

// Export the authMiddleware function to be used in other modules
module.exports = authMiddleware;