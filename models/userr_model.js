const db = require('../database'); // Import the pool object for connecting to a database
const saltRounds = 10; // Define the number of salt rounds for bcrypt hashing
const bcrypt = require('bcryptjs'); // Import the bcrypt library

const userr = {
    // Get a user by their ID
    getUserbyid: function (id, callback) {
        return db.query('select * from userr where userid= $1;', [id], callback);
    },

    // Add a new user to the database
    add: function (newUser, callback) {
        return db.query('insert into userr (email, fname, lname, phonenumber, username, password) values ($1, $2, $3, $4, $5, $6)',
            [newUser.email, newUser.fname, newUser.lname, newUser.phonenumber, newUser.username, newUser.password], callback);
    },

    // Get the profile data for a user by their ID
    getProfileData: function (id, callback) {
        return db.query('select userid, email, fname, lname, phonenumber, username, creation_time from userr where userid = $1',
            [id], callback);
    },

    // Check if an email already exists in the database
    findExistingEmail: function (checkEmail, callback) {
        console.log("checkEmail: " + checkEmail)
        return db.query('select email from userr where email = $1',
            [checkEmail], callback);
    },

    // Delete a user from the database by their ID adn delete ad's published by the user
    delete: function (id, callback) {
        db.query('DELETE FROM ad WHERE userid = $1', [id], (err, res) => {
            if (err) {
                return callback(err, null);
            }
            db.query('DELETE FROM userr WHERE userid = $1', [id], (err, res) => {
                if (err) {
                    return callback(err, null);
                }
                return callback(null, res);
            });
        });
    },

    // Update a user's information in the database
    update: function (id, user, callback) {
        // Hash the user's new password with bcrypt before updating it in the database
        bcrypt.hash(user.password, saltRounds, function (err, hash) {
            return db.query('update userr set email=$1, password=$2, fname=$3, lname=$4, phonenumber=$5, username=$6 where userid=$7;',
                [user.email, hash, user.fname, user.lname, user.phonenumber, user.username, id], callback);
        });
    },

    // Get the contact information for the user who posted a specific ad
    getAdPublisher: function (id, callback) {
        return db.query('select email, username, phonenumber, creation_time from userr where userid= $1', [id], callback);
    },
}

// Export the userr object to be used in other modules
module.exports = userr;