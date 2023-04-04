const express = require('express');
const { response } = require('../app');
const router = express.Router();
const ad = require('../models/ad_model');

router.get('/:id',
 function(request, response) {
  if (request.params.id) {
    ad.getAdbyid(request.params.id, function(err, dbResult) {
      if (err) {
        response.json(err);
      } else {
        let data = dbResult;
        response.json(data.rows);
      }
    });
  }
});

router.get('/', function (response) {

  ad.getAdAll(function(err, dbResult) {
    if (err) {
      console.log(err);
    } else {
      let data = dbResult;
      try{
        response.json(data.rows)
      } catch(err){
        response.send("nothing found")
      }
    }
  });   
});

module.exports = router;