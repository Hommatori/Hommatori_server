const bcrypt = require('bcryptjs'); // Import the bcryptjs library for password hashing
const pool = require('../database.js'); // Import the pool object for connecting to a database
const LocalStrategy = require('passport-local').Strategy; // Import the LocalStrategy object for defining a local authentication strategy for Passport.js

module.exports = function (passport) { // Export a function that takes a passport object as an argument
  passport.use( // Define a local authentication strategy with the passport.use() method
    new LocalStrategy( // Use the LocalStrategy object to define the local authentication strategy
      {
        usernameField: 'email', // Use the email field as the username field
        passwordField: 'password', // Use the password field as the password field
        passReqToCallback: true, // Pass the request object to the callback function
      },
      async function (req, email, password, done) { // Define the callback function for the local authentication strategy, which takes the request object, email, password, and done function as arguments
        const client = await pool.connect(); // Connect to the database using the pool object and await the result
        try {
          await client.query('begin'); // Begin a transaction with the database using the client object and await the result

          const accCredentials = await client.query('select userid, password from userr where email = $1', [email]); // Query the database for the user's account credentials using the request email and await the result

          if (accCredentials.rows[0] == null) { // If the user's account credentials are not found in the database, return an error to the done function with the message "Incorrect credentials"
            return done(null, false, { message: 'Incorrect credentials' });
          } else { // If the user's account credentials are found in the database, compare the provided password with the hashed password using the bcrypt.compare() method
            bcrypt.compare(password, accCredentials.rows[0].password, async (err, valid) => {
              if (err) { // If there is an error during the password comparison, return the error to the done function
                return done(err);
              }
              if (valid) { // If the password is valid, query the database for the user's account data using the request email and await the result
                const accData = await client.query('select userid, fname, lname, email from userr where email = $1', [email]);
                const user = { // Create a user object with the user's account data and return it to the done function with no errors
                  id: accData.rows[0].userid,
                  email: accData.rows[0].email,
                  fname: accData.rows[0].fname,
                  lname: accData.rows[0].lname,
                };
                return done(null, user);
              } else { // If the password is invalid, return an error to the done function with the message "Incorrect credentials"
                return done(null, false, { message: 'Incorrect credentials' });
              }
            });
          }
        } catch (e) { // If there is an error during the authentication process, return the error to the done function
          return done(e);
        } finally { // Release the database pool client object after the transaction is complete
          client.release();
        }
      }
    )
  );
};