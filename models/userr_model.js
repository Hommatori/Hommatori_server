const db = require('../database');
const saltRounds=10;
const bcrypt = require('bcryptjs');

const userr = {
    getUserbyid: function(id, callback) {
        return db.query('select * from userr where userid= $1;',[id], callback);
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
    
    delete: function(id, callback) {
        return db.query('delete from userr where userid= $1;', [id], callback);
    },
    
    update: function(id, user, callback) {
        bcrypt.hash(user.password, saltRounds, function(err, hash) {
          return db.query('update userr set email=$1, password=$2, fname=$3, lname=$4, phonenumber=$5 where userid=$1;',
          [user.email, hash, user.fname, user.lname, user.phonenumber, id], callback);
        });
    },
    
    getAdPublisher: function(id, callback) {
        return db.query('select email, username, phonenumber, creation_time from userr where userid= $1',[id], callback);
    },
}

module.exports = userr;