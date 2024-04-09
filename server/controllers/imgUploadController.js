/*
----
Core Feature(s): Uploads an image to Azure Blob Storage.
Expected Input Type: (body or URL)
Expected Input: 
  - imageBuffer: Buffer containing the image data.
  - imageType: MIME type of the image.
  - AZURE_STORAGE_CONNECTION_STRING: Azure Storage connection string.
  - CONTAINER_NAME: Name of the container in Azure Blob Storage.
Expected Output Structure: 
  - URL of the uploaded image.
Expected Errors: 
  - Throws an error for internal server errors.
Purpose: To provide a function for uploading images to Azure Blob Storage.
----
*/



const azure = require('@azure/storage-blob'); // Import Azure Blob Storage SDK
const BlobServiceClient = azure.BlobServiceClient; // BlobServiceClient class from SDK
const { v1: uuidv1 } = require("uuid"); // Import uuidv1 function from uuid package

/**
 * Function to upload an image to Azure Blob Storage.
 * @param {Buffer} imageBuffer - Buffer containing the image data.
 * @param {string} imageType - MIME type of the image.
 * @param {string} AZURE_STORAGE_CONNECTION_STRING - Azure Storage connection string.
 * @param {string} CONTAINER_NAME - Name of the container in Azure Blob Storage.
 * @returns {string} - URL of the uploaded image.
 */
const uploadImage = async (imageBuffer, imageType, AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME) => {
    try {
        // Create the BlobServiceClient object with connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(CONTAINER_NAME);
        
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

module.exports = uploadImage; // Export the uploadImage function
