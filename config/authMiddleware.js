// Import the jsonwebtoken library
const jwt = require('jsonwebtoken');

// Define the authMiddleware function that will serve as a middleware for protected routes
const authMiddleware = (req, res, next) => {
  // Get the access token from the cookies of the incoming request
  const accessToken = req.cookies.accessToken;

  // If no access token is provided, return a 401 HTTP status code with a JSON object containing an error message
  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Decode and verify the access token using the jsonwebtoken library and the access token secret stored in an environment variable
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err) => {
    // If there is an error during authentication, return a 401 HTTP status code with a JSON object containing an error message
    if (err) {
      res.status(401).json({ message: 'Invalid token' });
    } else {
      next();
    }
  })
};

// Export the authMiddleware function to be used in other modules
module.exports = authMiddleware;