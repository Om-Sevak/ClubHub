const dotenv = require('dotenv');
const azure = require('@azure/storage-blob');
const BlobServiceClient = azure.BlobServiceClient;
const { v1: uuidv1 } = require("uuid");

if (!process.env.ENVIRONMENT) {
    dotenv.config({path:'./config/.env'});
}

// Azure Blob Storage configuration
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const CONTAINER_NAME = process.env.CONTAINER_NAME;

// Create the BlobServiceClient object with connection string
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);

const uploadImage = async (imageBuffer, imageType) => {
    try {
        // Generate unique blob name
        const blobName = "club-logo-" + uuidv1();

        // Get BlockBlobClient to upload the image
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        
        // Set the content type for the image
        const options = { blobHTTPHeaders: { blobContentType: imageType } };

        // Upload the image file
        const uploadBlobResponse = await blockBlobClient.upload(imageBuffer, imageBuffer.length, options);

        // Construct the URL for the uploaded image
        const imageUrl = `${blockBlobClient.url}`;

        return imageUrl;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw new Error('Internal server error');
    }
};

module.exports = uploadImage;

