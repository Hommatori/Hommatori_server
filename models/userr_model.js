const db = require('../database');
const saltRounds=10;
const bcrypt = require('bcryptjs');

const userr = {

    getUserbyid: function(id, callback) {
        return db.query('select * from userr where userid= $1;',[id], callback);
    },

    getUserAll: function(callback) {
        return db.query('select * from userr', callback);
    },


    add: function(params, callback) {
        return db.query('insert into userr (userid, email, password, fname, lname, phonenumber) values ($1, $2, $3, $4, $5, $6);',
        [params.userid, params.email, params.password, params.fname, params.lname, params.phonenumber], callback);
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