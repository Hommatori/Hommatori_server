const jwt = require('jsonwebtoken');
const { decryptData } = require('./crypto');

const authMiddleware = (req, res, next) => {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const encryptedUserData = decoded.encryptedData;
    const userData = decryptData(encryptedUserData);
    req.user = userData;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = authMiddleware;