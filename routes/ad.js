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
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const fileBuffer = file.buffer;
    const { mime } = fileType(fileBuffer);
    if (allowedTypes.includes(mime)) {
      callback(null, true);
    } else {
      callback(new Error("Invalid file type. Only JPEG, PNG, and JPG files are allowed."));
    }
  }
});

router.get('/:id',
  function (request, response) {
    if (request.params.id) {
      ad.getAdbyid(request.params.id, function (err, dbResult) {
        if (err) {
          console.log(err)
          response.status(500).json('internal server error');
        } else {
          let data = dbResult;
          if (data.rows.length == 0) {
            response.status(404).json("not found");
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
      response.status(500).json('internal server error');
    } else {
      let data = dbResult;
      try {
        response.status(200).json(data.rows)
      } catch (err) {
        response.status(404).json("nothing found")
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
          response.status(500).json('internal server error');
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
          response.status(500).json('internal server error');
        } else {
          let data = dbResult;
          if (data.rows.length == 0) {
            response.status(404).json("not found");
          } else {
            response.status(200).json(data.rows);
          }
        }
      });
    }
  });


router.post("/", AuthMiddleware, (req, res) => {
  const requiredFields = ['type', 'header', 'description', 'location', 'price', 'userid', 'region', 'municipality'];
  for (const field of requiredFields) {
    if (!(field in req.body) || typeof req.body[field] !== 'string') {
      res.status(400).json(`Missing or invalid ${field} from request body`);
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
    municipality: req.body.municipality
  }

  try {
    //  console.log(newAd)
    //  console.log(newAd.adid)
    ad.add(newAd, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send('internal server error');
      } else {
        res.status(200).json('ad created');
      }
    });
  }
  catch (e) {
    res.status(500).json('could not create ad');
  }
});

// Route for uploading an image to an ad
router.post("/imageupload", upload.single("image"), async (req, res) => {
  if (!req.body.adid || !req.file) {
    console.log("Request data missing or invalid file type");
    return res.status(400).send('Please fill all form data and check file type');
  } else {
    try {
      const file = req.file; // The uploaded file object
      const originalName = file.originalname; // The original name of the file
      const fileBuffer = file.buffer; // The file data as a Buffer

      // Generate a unique ID for the file name
      const uniqueId = uuidv4();
      const fileName = `${uniqueId}-${originalName}`;

      // Upload the file to Azure Blob Storage
      const blockBlobClient = containerClient.getBlockBlobClient(fileName);
      await blockBlobClient.uploadData(fileBuffer, { blobHTTPHeaders: { blobContentType: file.mimetype } });

      // Construct the uploaded file URL
      const fileUrl = `https://${containerName}.blob.core.windows.net/${fileName}`;
      let params = {
        adid: req.body.adid,
        image_url: fileUrl
      }

      ad.modifyImages(params, function (err, dbResult) {
        if (err) {
          console.log(err);
          res.status(500).send('internal server error');
        } else {
          console.log("image path updated succesfully");
          res.status(200).send('successful');
        }
      })

    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error uploading file" });
    }
  }

});

// Route for deleting an ad by it's ID
router.delete('/:id', AuthMiddleware, (req, response) => {
  ad.delete(req.params.id, function (err) {
    if (err) {
      console.log(err)
      response.status(500).json('internal server error');
    } else {
      response.status(200).json('deleted successfully');
    }
  })
})

// Route to update ad data by ad's ID
router.put('/:id', AuthMiddleware, function (request, response) {
  ad.update(request.params.id, request.body, function (err, dbResult) {
    if (err) {
      response.json(err);
    } else {
      response.json(dbResult);
    }
  });
});

// Export the routes to be used in other modules
module.exports = router;