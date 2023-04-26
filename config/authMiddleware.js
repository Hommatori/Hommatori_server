const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
  
    if (!accessToken) {
        return res.status(401).json({ message: 'No token provided' });
    }
  
    try {
        const decoded = jwt.verify(accessToken, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = authMiddleware;