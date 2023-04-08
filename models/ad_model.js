const db = require('../database');

const ad = {

    getAdbyid: function(id, callback) {
        return db.query('select * from ad where adid= $1',[id], callback);
    },

    getAdAll: function(callback) {
        return db.query('select * from ad', callback);
    },

    getByParams: function(params, callback) {

      // we want the query to return both total result row count as a specified amount of results at a time
      // we achieve this by using Common Table Expression (CTE) or a subquery
      let queryString = 'with rowcount as (select count(adid) as total_rows from ad'; // start with defining total_rows (total row count) 
      let queryArray = [];

      // check if first parameters are given and add to query array accordingly
      if (params.type && params.type !== 'all') {
        queryArray.push(`type = '${params.type}'`);
      }
      if (params.region && params.region !== 'all') {
        queryArray.push(`region = '${params.region}'`);
      }
      if (params.query) {
        let queryWords = params.query.split(' ').map(word => `'%${word}%'`);
        queryArray.push(`header ilike all (array[${queryWords}]) or description ilike all (array[${queryWords}])`);
      }          
    
      // construct SQL query string      
      if (queryArray.length > 0) {
        queryString += ` where ${queryArray.join(' and ')}`; // add filtering through params
      }
      queryString += '), result as (select * from ad' // our second query (through which we return the actual query results) starts here
      if (queryArray.length > 0) {
        queryString += ` where ${queryArray.join(' and ')}`; // add params filtering to secong query as well
      }          

      // check final query params
      if (params.order == '1') {  // sort by oldest date first
        queryString += ` order by date desc limit 4`;
      } else if (params.order == '2') { // sort by lowest first    
        queryString += ` order by price asc limit 4`;
      }else if (params.order == '3') { // sort by higest price first  
        queryString += ` order by price desc limit 4`;
      } else { // sort by newest date first (default)
        queryString += ` order by date asc limit 4`;
      }
      if (params.offset != 'undefined') { // since we return only a specified amount of results, you can request overflow pages by number
        const defaultNumOfResults = 4;
        let pageNumber = params.offset * defaultNumOfResults;
        queryString += ` offset ${pageNumber}`;
      }
      // and finally we make the query to return an object where total rowcount is a key-value pair ("total_rows": "*value here*")
      // and actual data is a table of objects (with the key "data")
      queryString += ') select rowcount.total_rows, json_agg(result.*) as data from rowcount, result group by rowcount.total_rows'
    
      // execute query and return results
      return db.query(queryString, callback);
    },    
}

module.exports = ad;