const db = require('../database');

const ad = {

    getAdbyid: function(id, callback) {
        return db.query('select * from ad where adid= $1',[id], callback);
    },

    getAdAll: function(callback) {
        return db.query('select * from ad', callback);
    }
    
}

module.exports = ad;