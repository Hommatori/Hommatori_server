const express = require('express');
const router = express.Router();
const userr = require('../models/userr_model');
const AuthMiddleware = require('../authMiddleware.js');
const { v4: uuidv4 } = require('uuid');

router.get('/:id', function(request, response) {
  if (request.params.id) {
    userr.getProfileData(request.params.id, function(err, dbResult) {
      if (err) {
        response.status(500).json('internal server error');
      } else {
        let data = dbResult;
        response.status(200).json(data.rows[0]);
      }
    });
  }
});

router.get('/protected/:id', AuthMiddleware, function(request, response) {
  try {
    // retrieve the user's profile information from the database
    userr.getProfileData(request.params.id, function(err, dbResult) {
      if (err) {
        response.status(500).json('internal server error');
      } else {
        let data = dbResult;
        response.status(200).json(data.rows[0]);
      }
    });
  } catch (err) {
    console.error(err);
    response.status(500).json({ message: 'Server error' });
  }
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

  })
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