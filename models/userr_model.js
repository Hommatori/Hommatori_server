const db = require('../database');

const userr = {
    getAdPublisher: function(id, callback) {
        return db.query('select email, username, phonenumber, creation_time from userr where userid= $1',[id], callback);
    },

    add: function(newUser, callback) { 
        return db.query('insert into userr (email, fname, lname, phonenumber, username, password) values ($1, $2, $3, $4, $5, $6)',
        [newUser.email, newUser.fname, newUser.lname, newUser.phonenumber, newUser.username, newUser.password], callback);
    },
  
    getProfileData: function(id, callback) { 
        return db.query('select userid, email, fname, lname, phonenumber, username, creation_time from userr where userid = $1',
        [id], callback);
    },

    findExistingEmail: function(checkEmail, callback) {
        console.log("checkEmail: " + checkEmail)
        return db.query('select email from userr where email = $1',
        [checkEmail], callback);
    },    
}

module.exports = userr;