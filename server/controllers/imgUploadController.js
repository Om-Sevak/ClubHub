/*
----
Core Feature(s): Image Upload to Azure Blob Storage
Expected Input Type: Buffer containing image data, string specifying image MIME type, Azure storage connection string, container name
Expected Input: Image buffer, image type, connection string, container name
Expected Output Structure: String representing the URL of the uploaded image
Expected Errors: Internal server error
Purpose: This function facilitates the upload of images to Azure Blob Storage. It accepts an image buffer, MIME type, Azure storage connection string, and container name as input parameters. The function then creates a BlobServiceClient object, retrieves the container client, generates a unique blob name, and uploads the image to the specified container. Finally, it constructs and returns the URL for the uploaded image.
----
*/


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

