// Import required modules
const express = require('express');
const router = express.Router();
const userr = require('../models/userr_model');
const AuthMiddleware = require('../config/authMiddleware.js');

// Route for getting user by user's ID
router.get('/:id', function (request, response) {
  if (request.params.id) {
    userr.getProfileData(request.params.id, function (err, dbResult) {
      if (err) {
        response.status(500).json('internal server error');
      } else {
        let data = dbResult;
        response.status(200).json(data.rows[0]);
      }
    });
  }
});

// Route for getting ad publisher's data by ad's ID to show publisher data in single ad page
router.get('/ad/:id', function (request, response) {
  if (request.params.id) {
    // Retrieve some fields to show simple ad publisher data
    userr.getAdPublisher(request.params.id, function (err, dbResult) {
      if (err) {
        response.status(500).json('internal server error');
      } else {
        let data = dbResult;
        response.status(200).json(data.rows[0]);
      }
    });
  }
});

// Route for getting user's private data to show in user's account page
router.get('/getprivatedata/:id', AuthMiddleware, function (request, response) {
  try {
    // Retrieve the user's profile information from the database
    userr.getProfileData(request.params.id, function (err, dbResult) {
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

// Route for deleting a user by it's ID
router.delete('/:id', AuthMiddleware, function (request, response) {
  // Delete user from database
  userr.delete(request.params.id, function (err) {
    if (err) {
      console.log(err)
      response.status(500).json('internal server error');
    } else {
      response.status(200).json('successfully deleted account');
    }
  });
}
);


// Route to update user's data by user's ID
router.put('/:id', AuthMiddleware, function (request, response) {
  userr.update(request.params.id, request.body, function (err, dbResult) {
    if (err) {
      response.json(err);
    } else {
      response.json(dbResult);
    }
  });
});

// Export the routes to be used in other modules
module.exports = router;