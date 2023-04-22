const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
require('./config/passport')(passport);

const app = express();
const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.JWT_SECRET_KEY;

const userrRouter = require('./routes/userr');
const adRouter = require('./routes/ad');
const signupRouter = require('./routes/signup.js');

// Configure express-session middleware
app.use(session({
  user: null,
  secret: SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Configure passport middleware
app.use(passport.initialize());
app.use(passport.session());

const corsOptions = {
  origin: process.env.NEXTJS_ADDRESS,
  credentials: true, // Allow cookies to be sent with requests
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.post('/login',
  (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send('Unauthorized');
    }

    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8').split(':');
    const email = credentials[0];
    const password = credentials[1];

    req.body.email = email;
    req.body.password = password;

    next();
  },
  passport.authenticate('local'), (req, res) => {
  // user authentication already done through passport here
  // Set the user object in session data
  req.session.user = { id: req.user.id, fname: req.user.fname };
  console.log('Session set:', req.session); // Add this line
  console.log("yes")
  return res.status(200).json({user: req.user });
})

app.post('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

app.use('/userr', userrRouter);
app.use('/ad', adRouter);
app.use('/signup', signupRouter);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

module.exports = app;