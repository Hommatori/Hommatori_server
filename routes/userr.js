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

router.get('/ad/:id', function(request, response) { // get ad publisher's data by ad's ID to show publisher data in nextjs single ad page
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

router.get('/getprivatedata/:id', AuthMiddleware, function(request, response) {
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

router.delete('/:id', AuthMiddleware, function(request, response) {
  userr.delete(request.params.id, function(err, count) {

  })
  try {
    // retrieve the user's profile information from the database
    userr.delete(request.params.id, function(err, dbResult) {
      if (err) {
        response.status(500).json('internal server error');
      } else {
        response.status(200).json('successfully deleted account');
      }
    });
  } catch (err) {
    console.error(err);
    response.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', AuthMiddleware, function(request, response) {
  userr.update(request.params.id, request.body, function(err, dbResult) {
    if (err) {
      response.json(err);
    } else {
      response.json(dbResult);
    }
  });
});

module.exports = router;