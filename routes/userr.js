const express = require('express');
const router = express.Router();
const userr = require('../models/userr_model');

router.get('/:id',
 function(request, response) {
  if (request.params.id) {
    userr.getUserbyid(request.params.id, function(err, dbResult) {
      if (err) {
        response.json(err);
      } else {
        let data = dbResult;
        response.json(data.rows);
      }
    });
  }
});

router.get('/', function (req, res) {

  userr.getUserAll(function(err, dbResult) {
    if (err) {
      console.log(err);
    } else {
      let data = dbResult;
      try{
        res.json(data.rows)
      } catch(err){
        res.send("nothing found")
      }
    }
  });   
});

router.post('/', 
function(request, response) {
  userr.add(request.body, function(err, count) {
    if (err) {
      response.json(err);
    } else {
      response.json(request.body); 
    }
  });
});


module.exports = router;