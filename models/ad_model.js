const db = require('../database');

const ad = {

    getAdbyid: function(id, callback) {
        return db.query('select * from ad where adid= $1',[id], callback);
    },

    getAdAll: function(callback) {
        return db.query('select * from ad', callback);
    },

    getByParams: function(params, callback) {

        let queryArray = [];

        // check if parameters are given and add to query array accordingly
        if (params.type !== 'all') {
            queryArray.push(`type = '${params.type}'`);
          }
          if (params.region !== 'all') {
            queryArray.push(`region = '${params.region}'`);
          }
          if (params.query) {
            let queryWords = params.query.split(' ').map(word => `'%${word}%'`);
            queryArray.push(`header ilike all (array[${queryWords}]) or description ilike all (array[${queryWords}])`);
          }          
        
          // construct SQL query string
          let queryString = 'select * from ad';
          if (queryArray.length > 0) {
            queryString += ` where ${queryArray.join(' and ')}`;
          }

          // check final query params
          if (params.order == '1') {  // sort by oldest date first
            queryString += ` order by date desc limit 8`;
          } else if (params.order == '2') { // sort by lowest first    
            queryString += ` order by price asc limit 8`;
          }else if (params.order == '3') { // sort by higest price first  
            queryString += ` order by price desc limit 8`;
          } else { // sort by newest date first (default)
            queryString += ` order by date asc limit 8`;
          }
          if (params.offset != 'undefined') { // since we return only a specified amount of results, you can request overflow pages by number
            const defaultNumOfResults = 8;
            let pageNumber = params.offset * defaultNumOfResults;
            queryString += ` offset ${pageNumber}`;
          }
        
          // execute query and return results
          return db.query(queryString, callback);
    },    
}

module.exports = ad;