// Import the db object for connecting to the PostgreSQL database
const db = require('../database');

// Define an ad object with methods for interacting with the "ad" table in the database
const ad = {

  // Get an ad by its ID
  getAdbyid: function (id, callback) {
    return db.query('select * from ad where adid = $1', [id], callback);
  },

  // Get all ads
  getAdAll: function (callback) {
    return db.query('select * from ad', callback);
  },

  // Get ads by filtering through specified parameters (params)
  getByParams: function (params, callback) {
    // We want the query to return both total result row count as a specified amount of results at a time
    // We achieve this by using Common Table Expression (CTE) or a subquery
    let queryString = 'with rowcount as (select count(adid) as total_rows from ad'; // start with defining total_rows (total row count) 
    let queryArray = [];

    // Check if first parameters are given and add to query array accordingly
    if (params.type && params.type !== 'all' && params.type.trim() !== 'null') {
      queryArray.push(`type = '${params.type}'`);
    }
    if (params.region && params.region !== 'all' && params.region.trim() !== 'null') {
      queryArray.push(`region = '${params.region}'`);
    }
    if (params.query && params.query.trim() !== 'null') {
      let queryWords = params.query.split(' ').map(word => `'%${word}%'`);
      queryArray.push(`(header ilike all (array[${queryWords}]) or description ilike all (array[${queryWords}]))`);
    }

    // Construct SQL query string      
    if (queryArray.length > 0) {
      queryString += ` where ${queryArray.join(' and ')}`; // Add filtering through params
    }
    queryString += '), result as (select * from ad' // Our second query (through which we return the actual query results) starts here
    if (queryArray.length > 0) {
      queryString += ` where ${queryArray.join(' and ')}`; // Add params filtering to secong query as well
    }

    // Check final query params
    if (params.order == '1') {  // Sort by oldest date first
      queryString += ` order by date desc limit 10`;
    } else if (params.order == '2') { // Sort by lowest first    
      queryString += ` order by price asc limit 10`;
    } else if (params.order == '3') { // Sort by higest price first  
      queryString += ` order by price desc limit 10`;
    } else { // Sort by newest date first (default)
      queryString += ` order by date asc limit 10`;
    }

    if (params.page && params.page.trim() !== 'null') { // Since we return only a specified amount of results, you can request overflow pages by number
      const defaultNumOfResults = 10; // Return 10 results per page
      let offset = params.page - 1 // Set offset for page sql query (page requests start from 1 but sql request for page 1 has offset 0)
      let pageNumber = offset * defaultNumOfResults;
      queryString += ` offset ${pageNumber}`;
    } else {
      const defaultNumOfResults = 10; // Return 10 results per page
      let offset = 0 // Set default offset for page sql query (page requests start from 1 but sql request for page 1 has offset 0)
      let pageNumber = offset * defaultNumOfResults;
      queryString += ` offset ${pageNumber}`;
    }
    // And finally we make the query to return an object where total rowcount is a key-value pair ("total_rows": "*value here*")
    // And actual data is a table of objects (with the key "data")
    queryString += ') select rowcount.total_rows, json_agg(result.*) as data from rowcount, result group by rowcount.total_rows'

    // Execute query and return results    
    return db.query(queryString, callback);
  },

  getByUserId: function (userid, callback) {
    return db.query('select * from ad where userid = $1', [userid], callback);
  },

  // Add a new ad to the database
  add: function (newAd, callback) {
    return db.query('insert into ad (adid, type, header, description, location, price, userid, region, municipality) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [newAd.adid, newAd.type, newAd.header, newAd.description, newAd.location, newAd.price, newAd.userid, newAd.region, newAd.municipality], callback);
  },

  // Update an existing ad in the database
  update: function (newAd, callback) {
    return db.query('insert into ad(adid, type, header, description, location, price, userid, region, municipality) values ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [newAd.adid, newAd.type, newAd.header, newAd.description, newAd.location, newAd.price, newAd.userid, newAd.region, newAd.municipality], callback);
  },

  // Delete an ad from the database
  delete: function (id, callback) {
    return db.query('delete from ad where adid = $1', [id], callback);
  },
}

// Export the ad object to be used in other modules
module.exports = ad;
