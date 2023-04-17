const db = require('../database');

const userr = {

    getUserbyid: function(id, callback) {
        return db.query('select * from userr where userid= $1',[id], callback);
    },

    getUserAll: function(callback) {
        return db.query('select * from userr', callback);
    },

    getAdPublisher: function(id, callback) {
        return db.query('select email, username, phonenumber, creation_time from userr where userid= $1',[id], callback);
    },

    add: function(newUser, callback){
        return db.query('insert into userr values (?,?,?,?,?,?)');
    }
    
}

module.exports = userr;