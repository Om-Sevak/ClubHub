/*
Core Feature(s): Image Upload to Azure Blob Storage
Expected Input Type: Binary image data (imageBuffer), string (imageType), string (AZURE_STORAGE_CONNECTION_STRING), string (CONTAINER_NAME)
Expected Input: Image buffer, image type (e.g., "image/jpeg"), Azure storage connection string, container name
Expected Output Structure: String (URL of the uploaded image)
Expected Errors: Error message if there is an issue uploading the image or if there is a server error
Purpose: Uploads an image to Azure Blob Storage and returns the URL of the uploaded image.
*/

const azure = require('@azure/storage-blob');
const BlobServiceClient = azure.BlobServiceClient;
const { v1: uuidv1 } = require("uuid");


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

