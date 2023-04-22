const bcrypt= require('bcryptjs');
const pool = require('../database.js');
const userr = require('../models/userr_model');

const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });
      
    passport.deserializeUser(function(id, done) {
        userr.getProfileData(id, function(err, user) {
            done(err, user);
        });
    });

    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    function(email, password, done){
        loginUser();

        async function loginUser() {
            const client = await pool.connect();
            try {
                await client.query('begin');
                const accCredentials = await client.query('select userid, password from userr where email = $1', [email]);

                if(accCredentials.rows[0] == null) {
                    return done(null, false, { message: 'Incorrect credentials' });
                } else {
                    bcrypt.compare(password, accCredentials.rows[0].password, (err, valid) => {
                        if(err) {
                            return done(err);
                        }
                        if(valid) {
                            getUserData();
                        } else {
                            return done(null, false, { message: 'Incorrect credentials' });
                        }
                    });
                }                    
            } catch(e){
                return done(e);
            } finally {
                client.release();
            }
        }

        async function getUserData() {
            const client = await pool.connect();
            try {
                const accData = await client.query('select userid, fname, lname, email from userr where email = $1', [email]);
                const user = {
                    id: accData.rows[0].userid,
                    email: accData.rows[0].email,
                    fname: accData.rows[0].fname,
                    lname: accData.rows[0].lname
                }               

                return done(null, user);
            } catch(e){
                return done(e);
            } finally {
                client.release();
            }
        }
    }));
};