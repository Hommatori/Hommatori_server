const express = require('express');
const router = express.Router();
const ad = require('../models/ad_model');

router.get('/:id',
 function(request, response) {
  if (request.params.id) {
    ad.getAdbyid(request.params.id, function(err, dbResult) {
      if (err) {;
        console.log(err)
        response.status(500).json('internal server error');
      } else {
        let data = dbResult;
        response.status(200).json(data.rows);
      }
    });
  }
});

router.get('/', function (request, response) {

  ad.getAdAll(function(err, dbResult) {
    if (err) {
      console.log(err);
      response.status(500).json('internal server error');
    } else {
      let data = dbResult;
      try{
        response.status(200).json(data.rows)
      } catch(err){
        response.status(404).json("nothing found")
      }
    }
  });   
});

router.get('/withparams/get',
 function(request, response) {
  if (request.query) {
    ad.getByParams(request.query, function(err, dbResult) {
      if (err) {
        console.log(err);
        response.status(500).json('internal server error');
      } else {
        let data = dbResult;
        if(data.rows.length >  0){
          response.status(200).json(data.rows[0]);
        } else {
          response.status(404).json(data.rows);
        }
      }
    });
  }
});

module.exports = router;