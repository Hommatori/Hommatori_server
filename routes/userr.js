const express = require('express');
const router = express.Router();
const userr = require('../models/userr_model');

router.get('/:id', function(request, response) {
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

router.get('',function (response) {
  userr.getUserAll(function(err, dbResult) {
    if (err) {
      response.json(err);
    } else {
      let data = dbResult;
      response.json(data.rows);
    }
  });   
});

router.get('/ad/:id', function(request, response) {
    if (request.params.id) {
      userr.getAdPublisher(request.params.id, function(err, dbResult) {
        if (err) {
          response.json(err);
        } else {
          let data = dbResult;
          response.json(data.rows[0]);
        }
      });
    }
  });

router.post('/', function(request, response) {
  userr.add(request.body, function(err, count) {
    if (err) {
      response.json(err);
    } else {
      response.json(request.body); 
    }
  });
});


module.exports = router;