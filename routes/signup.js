// Import required modules
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const user = require('../models/userr_model');

// Route for adding new user
router.post('/', function (req, res) {
  const requiredFields = ['fname', 'lname', 'phonenumber', 'username', 'password', 'email']; // Define required request body fields

  for (const field of requiredFields) { // Loop through requiredFields and check if they exist in request body
    if (!(field in req.body) || typeof req.body[field] !== 'string') {
      res.status(400).json({ status: `Missing or invalid ${field} from request body` });
      return;
    }
  }

  //check if a customer already exists with the given email
  try {
    let checkEmail = req.body.email.toLowerCase();
    user.findExistingEmail(checkEmail, function (err, dbResult) {
      if (dbResult.rows.length) { //existing email found
        console.log("email exists")
        res.status(400).json({ status: "Email already exists!" });
        return;
      } else {
        //create hash of the password
        const salt = bcrypt.genSaltSync(10);
        const passwordHash = bcrypt.hashSync(req.body.password, salt);

        // Create a new user object
        const newUser = {
          fname: req.body.fname,
          lname: req.body.lname,
          email: req.body.email.toLowerCase(),
          phonenumber: req.body.phonenumber,
          username: req.body.username,
          password: passwordHash //password needs to be hashed
        }

        // Add the new user to the database
        user.add(newUser, function (err) {
          if (err) {
            console.log(err);
            console.log("database error")
            res.status(500);
            return;
          } else {
            res.status(201).json({ status: "user created" });
            console.log("user created with email: " + newUser.email);
          }
        });
      }
    });
  } catch (err) {
    console.log("an error occurred")
    return;
  }
})

// Route for validating if an email already exists in the database
router.get('/validateemail/:email', (req, res, next) => {
  if (!req.params.email) {
    res.status(400).send('Missing email parameter');
    return;
  }
  const checkEmail = req.params.email.toLowerCase();
  user.findExistingEmail(checkEmail, (err, dbResult) => {
    if (err) {
      console.log('Database error:', err);
      next(err);
      return;
    }
    if (dbResult.rows.length) {
      console.log('Email already exists:', dbResult.rows);
      res.status(400).send('email_exists');
      return;
    }
    console.log('Email is available');
    res.status(200).send('OK');
  });
});

// Export the routes to be used in other modules
module.exports = router;