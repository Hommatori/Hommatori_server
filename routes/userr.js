const express = require('express');
const router = express.Router();
const userr = require('../models/userr_model');
const AuthMiddleware = require('../authMiddleware.js');

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

router.get('/ad/:id', function(request, response) {
    if (request.params.id) {
      userr.getAdPublisher(request.params.id, function(err, dbResult) {
        if (err) {
          response.status(500).json('internal server error');
        } else {
          let data = dbResult;
          response.status(200).json(data.rows[0]);
        }
      });
    }
});

module.exports = router;