const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
require('./config/passport')(passport);
const jwt = require('jsonwebtoken');
const { encryptData, decryptData } = require("./config/crypto");

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
  async (req, res, next) => {
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
  passport.authenticate('local', { session: false }),
  async function(req, res) {
    const user = req.user;
    if (!user) {
      return res.status(401).send();
    }

    const encryptedKey = req.body.encryptedKey;
    console.log("yks1: " + encryptedKey)
    const decryptedKey = encryptedKey ? decryptData(encryptedKey, process.env.MOBILE_SECRET_KEY) : null;
    console.log("kakka: " + decryptedKey)
    const expectedKey = process.env.MOBILE_TOKEN_ORIGINAL;
    console.log("kasifjiop: " + expectedKey)

    const shouldSendUserDirectly = encryptedKey && decryptedKey === expectedKey;
    console.log("kaks2: " + shouldSendUserDirectly)
    
    const userData = shouldSendUserDirectly ? user : encryptData(user);
    const jwtExpiry = shouldSendUserDirectly ? '15d' : '1d';
    console.log("kolme3: " + userData)
    console.log("nelj4: " + jwtExpiry)

    const accessToken = jwt.sign({ token: userData }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: jwtExpiry });

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      path: '/',
    });

    return res.status(200).json({ message: 'Logged in' });
  }
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