const express = require('express');
const router = express.Router();
const userr = require('../models/userr_model');
const { v4: uuidv4 } = require('uuid');

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


router.post('/', function(req, response) {

  let params = {
    userid: req.body.userid,
    fname: req.body.fname,
    lname: req.body.lname,
    email: req.body.email,
    phonenumber: req.body.phonenumber,
    password: req.body.password
}

  userr.add(params, function(err, dbResult) {
    if (err) {
      response.json(err);
    } else {
      response.json(dbResult);
    }
  });
});

router.delete('/:id',
function(request, response) {
  userr.delete(request.params.id, function(err, count) {

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
      response.json(count);
    }
  });
});

router.put('/:id',
function(request, response) {
  userr.update(request.params.id, request.body, function(err, dbResult) {
    if (err) {
      response.json(err);
    } else {
      response.json(dbResult);
    }
  });
});

module.exports = router;