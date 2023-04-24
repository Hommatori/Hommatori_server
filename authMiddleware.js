const isAuthenticated = (req, res, next) => {
  const cookies = req.cookies;

  const userCookie = cookies.user;
  const sessionCookie = cookies.session;

  if (!sessionCookie || !userCookie || sessionCookie === "null" || userCookie === "null") {
    return res.status(401).json({ error: 'Unauthorized' });
  } else {
    return next();
  }    
};

module.exports = isAuthenticated;