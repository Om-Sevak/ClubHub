const express = require("express");
const router = express.Router();
const multer = require('multer');
const dotenv = require('dotenv');
const azure = require('@azure/storage-blob');
const BlobServiceClient = azure.BlobServiceClient;
const { v1: uuidv1 } = require("uuid");

if (!process.env.ENVIRONMENT) {
    dotenv.config({path:'./config/.env'});
}

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.CONTAINER_NAME;

// Create the BlobServiceClient object with connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

const validateContentType = (req, res, next) => {
    if (req.is('multipart/form-data')) {
        next();
    } else {
        return res.status(400).json({ message: 'Invalid content type' });
    }
};

// Route for uploading image
router.post('/', upload.single('image'), validateContentType, async (req, res) => {
    try {
        // Ensure request contains image file
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // Generate unique blob name
        const blobName = "club-logo-" + uuidv1();

        // Get BlockBlobClient to upload the image
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        //get image file type
        const imageType = req.file.mimetype;
        console.log(imageType);
        // Set the content type for the image
        const options = { blobHTTPHeaders: { blobContentType: imageType } };
        // Upload the image file
        const uploadBlobResponse = await blockBlobClient.upload(req.file.buffer, req.file.size, options);

        // Construct the URL for the uploaded image
        const imageUrl = `${blockBlobClient.url}`;

        // Send response with image URL
        res.status(200).json({ imageUrl });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
