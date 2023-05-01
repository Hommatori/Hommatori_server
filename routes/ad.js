const express = require('express');
const router = express.Router();
const ad = require('../models/ad_model');
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const multer = require('multer');
const AuthMiddleware = require('../config/authMiddleware.js');
const { BlobServiceClient } = require("@azure/storage-blob");

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerName = process.env.AZURE_CONTAINER_NAME;
const containerClient = blobServiceClient.getContainerClient(containerName);

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(new Error('Invalid file type. Only JPEG, PNG, and JPG files are allowed.'));
    }
  },
  limits: { fileSize: 1024 * 1024 * 5 } // 5 MB file size limit
});

router.get('/:id',
  function (request, response) {
    if (request.params.id) {
      ad.getAdbyid(request.params.id, function (err, dbResult) {
        if (err) {
          console.log(err)
          response.status(500).json({message: 'internal server error'});
        } else {
          let data = dbResult;
          if (data.rows.length == 0) {
            response.status(404).json({message: "not found"});
          } else {
            response.status(200).json(data.rows[0]);
          }
        }
      });
    }
  });

router.get('/', function (request, response) {

  ad.getAdAll(function (err, dbResult) {
    if (err) {
      console.log(err);
      response.status(500).json({message: 'internal server error'});
    } else {
      let data = dbResult;
      try {
        response.status(200).json(data.rows)
      } catch (err) {
        response.status(404).json({message: "nothing found"})
      }
    }
  });
});

router.get('/withparams/get',
  function (request, response) {
    if (request.query) {
      ad.getByParams(request.query, function (err, dbResult) {
        if (err) {
          console.log(err);
          response.status(500).json({message: 'internal server error'});
        } else {
          let data = dbResult;
          if (data.rows.length > 0) {
            response.status(200).json(data.rows[0]);
          } else {
            response.status(404).json(data.rows);
          }
        }
      });
    }
  });

router.get('/withuserid/get', AuthMiddleware,
  function (request, response) {
    if (request.query) {
      ad.getByUserId(request.query.userid, function (err, dbResult) {
        if (err) {
          console.log(err)
          response.status(500).json({message: 'internal server error'});
        } else {
          let data = dbResult;
          if (data.rows.length == 0) {
            response.status(404).json({message: "not found"});
          } else {
            response.status(200).json(data.rows);
          }
        }
      });
    }
  });


// Route for ad creation
const fields = [
  { name: 'image1', maxCount: 1 },
  { name: 'image2', maxCount: 1 },
  { name: 'image3', maxCount: 1 },
];

router.post("/", AuthMiddleware, upload.fields(fields), async (req, res) => {
  const requiredFields = ['type', 'header', 'description', 'location', 'price', 'userid', 'region', 'municipality'];
  for (const field of requiredFields) {
    if (!(field in req.body) || typeof req.body[field] !== 'string') {
      res.status(400).json({message: `Missing or invalid ${field} from request`});
      return;
    }
  }

  const newAd = {
    adid: uuidv4(),
    type: req.body.type,
    header: req.body.header,
    description: req.body.description,
    location: req.body.location,
    price: req.body.price,
    userid: req.body.userid,
    region: req.body.region,
    municipality: req.body.municipality,
    images: "" // Add the images property
  };

  try {
    const imageUrls = []; // Create an array to store the image URLs

    // Handle image uploads if any
    if (req.files && Object.keys(req.files).length > 0) {
      try {
        const imageUploadPromises = Object.values(req.files).flat().map(async (file) => {
          const fileBuffer = file.buffer;

          // Generate a unique ID for the file name
          const uniqueId = uuidv4();
          const fileName = `ad-hommatori-${uniqueId}`;

          // Upload the file to Azure Blob Storage
          const blockBlobClient = containerClient.getBlockBlobClient(fileName);
          await blockBlobClient.uploadData(fileBuffer, { blobHTTPHeaders: { blobContentType: file.mimetype } });

          // Construct the uploaded file URL
          const fileUrl = `https://${process.env.AZURE_STORAGEACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_CONTAINER_NAME}/${fileName}`;
          imageUrls.push(fileUrl); // Add the fileUrl to the imageUrls array

          // Return the fileUrl and additional information about the uploaded file
          return {
            url: fileUrl,
            originalName: file.originalname,
            mimetype: file.mimetype,
            size: file.size
          };
        });

        const uploadedImages = await Promise.all(imageUploadPromises);
        console.log({ message: "All images uploaded successfully", images: uploadedImages });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error uploading files" });
        return;
      }
    }

    // Set the images property of the newAd object to the stringified imageUrls array
    newAd.images = JSON.stringify(imageUrls);

    // Update the ad.add() function to include the images property
    ad.add(newAd, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send({message: 'internal server error'});
      } else {
        res.status(200).json({message: 'successfully created a new ad', adid: newAd.adid});
      }
    });
  }
  catch (e) {
    res.status(500).json({message: 'Experienced an internal server error while creating ad'});
  }
});

// Route for deleting an ad by it's ID
router.delete('/:id', AuthMiddleware, (req, response) => {
  ad.delete(req.params.id, function (err) {
    if (err) {
      console.log(err)
      response.status(500).json({message: 'internal server error'});
    } else {
      response.status(200).json({message: 'deleted successfully'});
    }
  })
})

// Route to update ad data by ad's ID
router.put('/:id', AuthMiddleware, function (request, response) {
  ad.update(request.params.id, request.body, function (err, dbResult) {
    if (err) {
      response.json({message: 'Failed to update ad'});
    } else {
      response.json(dbResult);
    }
  });
});

// Export the routes to be used in other modules
module.exports = router;