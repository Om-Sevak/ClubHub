/*********************************************************************************
	FileName: imgUploadController.js
	FileVersion: 1.0
	Core Feature(s): Image Upload to Azure Blob Storage
	Purpose: This module provides a function for uploading images to Azure Blob Storage. It accepts an image buffer, image type, Azure Storage connection string, and container name as inputs. The function generates a unique blob name, uploads the image to the specified container, and returns the URL for the uploaded image. In case of errors during the upload process, it throws an internal server error.
*********************************************************************************/


const azure = require('@azure/storage-blob');
const BlobServiceClient = azure.BlobServiceClient;
const { v1: uuidv1 } = require("uuid");

//explained by the main comment
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

module.exports = uploadImage;

