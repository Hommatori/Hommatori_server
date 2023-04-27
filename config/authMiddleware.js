const jwt = require('jsonwebtoken');
const { decryptData } = require('./crypto');

const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log( "decoded: " + decoded)
    const encryptedUserData = decoded.token;
    const userData = decryptData(encryptedUserData, process.env.CRYPTO_SECRET_KEY);
    console.log("userData: " + userData)

    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;