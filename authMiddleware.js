const isAuthenticated = (req, res, next) => {
  const userId = req.headers['x-session-user-id'];
  if (userId) {
    req.session = { user: { id: userId } };
    return next();
  } else {
    return res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = isAuthenticated;