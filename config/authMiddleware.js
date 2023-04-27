// Import the jsonwebtoken library and the decryptData function from a separate module
const jwt = require('jsonwebtoken');
const { decryptData } = require('./crypto');

// Define the authMiddleware function that will serve as a middleware for protected routes
const authMiddleware = (req, res, next) => {
  // Get the access token from the cookies of the incoming request
  const accessToken = req.cookies.accessToken;

  // If no access token is provided, return a 401 HTTP status code with a JSON object containing an error message
  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    // Decode and verify the access token using the jsonwebtoken library and the access token secret stored in an environment variable
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);

    // Extract the encrypted user data from the decoded token's payload
    const encryptedUserData = decoded.token;

    // Decrypt the encrypted user data using the decryptData function and the secret key stored in an environment variable,
    // however we do not do anything with the result, only run the decryptData function which will cause error if encryptedData has been tampered with
    const userData = decryptData(encryptedUserData, process.env.CRYPTO_SECRET_KEY);

    // If authentication is successful, call the next middleware or route handler in the pipeline
    next();
  } catch (error) {
    // If there is an error during authentication, return a 401 HTTP status code with a JSON object containing an error message
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Export the authMiddleware function to be used in other modules
module.exports = authMiddleware;