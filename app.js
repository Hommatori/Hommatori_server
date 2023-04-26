const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
require('./config/passport')(passport);
const jwt = require('jsonwebtoken');
const { encryptData } = require("./config/crypto");

const app = express();
const PORT = process.env.PORT || 8080;

const userrRouter = require('./routes/userr');
const adRouter = require('./routes/ad');
const signupRouter = require('./routes/signup.js');

app.use(cookieParser());
// Configure passport middleware
app.use(passport.initialize());

const corsOptions = {
  origin: process.env.NEXTJS_ADDRESS,
  credentials: true, // Allow cookies to be sent with requests
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

    console.log(req.body)

    next();
  },
  passport.authenticate('local', { session: false }, function(req, res, user, e) {
    if (e) {
      return res.status(500).send();
    }
    if (user) {
      return res.status(401).send();
    }


    const encryptedUser = encryptData(user);
    const accessToken = jwt.sign({ encryptedData: encryptedUser }, process.env.JWT_SECRET, { expiresIn: '1d' });

    console.log(encryptedUser)
    console.log(accessToken)

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      path: '/',
    });

    return res.status(200).json({ message: 'Logged in' });
  })
);

app.post("/logout", (req, res) => {
  res.clearCookie('accessToken');
  res.status(200).json({ message: 'Logged out' });
});

app.use('/userr', userrRouter);
app.use('/ad', adRouter);
app.use('/signup', signupRouter);

app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

module.exports = app;