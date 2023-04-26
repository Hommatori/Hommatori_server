const bcrypt = require('bcryptjs');
const pool = require('../database.js');

const LocalStrategy = require('passport-local').Strategy;

module.exports = function (passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true,
      },
      async function (req, email, password, done) {
        const client = await pool.connect();
        try {
          await client.query('begin');
          const accCredentials = await client.query('select userid, password from userr where email = $1', [email]);

          if (accCredentials.rows[0] == null) {
            return done(null, false, { message: 'Incorrect credentials' });
          } else {
            bcrypt.compare(password, accCredentials.rows[0].password, async (err, valid) => {
              if (err) {
                return done(err);
              }
              if (valid) {
                const accData = await client.query('select userid, fname, lname, email from userr where email = $1', [email]);
                const user = {
                  id: accData.rows[0].userid,
                  email: accData.rows[0].email,
                  fname: accData.rows[0].fname,
                  lname: accData.rows[0].lname,
                };
                return done(null, user);
              } else {
                return done(null, false, { message: 'Incorrect credentials' });
              }
            });
          }
        } catch (e) {
          return done(e);
        } finally {
          client.release();
        }
      }
    )
  );
};