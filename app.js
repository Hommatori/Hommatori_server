// Import required modules
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const passport = require('passport');
require('./config/passport')(passport);
const jwt = require('jsonwebtoken');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 8080; // 

// Import routes
const userrRouter = require('./routes/userr');
const adRouter = require('./routes/ad');
const signupRouter = require('./routes/signup.js');

// Middleware config - cookie parser and passowrd
app.use(cookieParser());
app.use(passport.initialize());


// Configure CORS options and middleware
const corsOptions = {
  origin: process.env.NEXTJS_ADDRESS,
  credentials: true, // Allow cookies to be sent with requests
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// Express middlewares
app.use(logger('dev')); // Terminal text coloring for development
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Login route, send JSON webtoken for future validation
app.post('/login',
  async (req, res, next) => { // Custom middleware for parsing Basic authentication header 
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send('Unauthorized');
    }

    // Extract email and password from the authentication header
    const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8').split(':');
    const email = credentials[0];
    const password = credentials[1];

    // Set email and password in the request body
    req.body.email = email;
    req.body.password = password;
    next(); // Continue sending auth header values to passport middleware
  },
  passport.authenticate('local', { session: false }), // Authenticate using passport middleware
  async function(req, res) {
    const user = req.user;
    if (!user) {
      return res.status(401).send();
    }

    const usingMobile = req.body.mobile; // Boolean from mobile app request    
    const jwtExpiry = usingMobile ? '30d' : '1d'; // Set token expiration longer for mobile app

    const accessToken = jwt.sign({ user: user }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: jwtExpiry }); // Sign jwt access token and attach basic user data as payload

    res.cookie('accessToken', accessToken, { // Sent JWT access token as a cookie
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return res.status(200).json({ message: 'Logged in' }); // Send success response
  }
);

// Log out user by removing access token cookie
app.post('/logout', (req, res) => {
  res.clearCookie('accessToken');
  res.clearCookie('userData');
  res.status(200).json({message: 'logged out'})
});

// Use imported routes
app.use('/userr', userrRouter);
app.use('/ad', adRouter);
app.use('/signup', signupRouter);

// Set app to listen for connections
app.listen(PORT, () => {
  console.log(`App listening at http://localhost:${PORT}`);
});

// Export app
module.exports = app;