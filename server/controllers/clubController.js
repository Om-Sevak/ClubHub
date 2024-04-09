
/*
----
Core Feature(s): Create/Edit Club
Expected Input Type: body
Expected Input: 
    - name: string (name of the club)
    - description: string (description of the club)
    - email: string (email of the club)
    - interest: string (comma-separated interests related to the club)
Expected Output Structure: 
    - JSON object
        {
            message: string (success message or error message)
        }
Expected Errors:
    - Unauthorized: Must sign in to create a club
    - Bad Request: Club with the provided name already exists
    - Bad Request: Invalid email format
    - Bad Request: Please select at least 3 interests
    - Bad Request: Server Error
Purpose: This feature allows users to create a new club with a name, description, email, and interests.
----
*/



const Club = require("../models/clubModel");
const User = require("../models/userModel")
const ClubMembership = require('../models/clubMembershipsModel');
const ClubPost = require('../models/clubPostModel');
const ClubEvent = require('../models/clubEventModel');
const ClubInterest = require('../models/clubInterestsModel');
const interests = require("./interestController")
const clubRole = require("./clubroleController");
const utils = require("../utils/utils");
const uploadImage = require("./imgUploadController");
const multer = require('multer');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const MAX_INTERESTS_PER_CLUB = 5; // Maximum number of interests per club

// Controller function to create a club
exports.createClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create club. Changes: ${JSON.stringify(req.body)}`);

        upload.single('image')(req, res, async (err) => { // Middleware to handle image upload

            const body = JSON.parse(JSON.stringify(req.body)); // Parsing request body
            const { name, description, email, interest } = body; // Destructuring request body

            if (err) { // Error handling for image upload
                console.error('Error uploading profile picture:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            try {

                if (!req.session.isLoggedIn) { // Check if user is logged in
                    throw new Error('Unauthorized: Must sign in to create a club');
                }
        
                // Validate that a club with the provided name doesn't already exist
                const club = await Club.findOne({ name: name });
                if (club) {
                    throw new Error(`Bad Request: Club called ${name} already exists`);
                }
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new Error('Bad Request: Invalid email format');
                }

                const interestArray = interest.split(","); // Convert interests string to array
                if (interestArray.length < MAX_INTERESTS_PER_CLUB){ // Check if minimum interests requirement is met
                    throw new Error('Bad Request: Please select at least 3 interests');
                }
        
                const userEmail = req.session.email; // Get user email from session
                const user = await User.findOne({ email: userEmail }); // Find user by email
                const userObjectId = user._id; // Get user's MongoDB object ID

                // Handle image upload
                let imageUrl = '';
                // If image is uploaded, upload to Azure Blob Storage, else use default image
                if (req.file){
                    // Azure Blob Storage configuration
                    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
                    const CONTAINER_NAME = process.env.CONTAINER_NAME;
                    // Get image buffer and type
                    const imageBuffer = req.file.buffer;
                    const imageType = req.file.mimetype;
                   
                    imageUrl = await uploadImage(imageBuffer, imageType, AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME);
                } else{
                     imageUrl = process.env.DEFAULT_LOGO_URL; 
                }

                console.log(`${req.sessionID} - ${req.session.email} uploaded a club logo.`);

                // Create new club in database
                const newClub = await Club.create({
                    name: name,
                    description: description,
                    email: email,
                    createdBy: userObjectId,
                    imgUrl: imageUrl
                });
        
                // Create admin role for the user who created the club
                const adminRole = await clubRole.createAdminRoleMiddleware(userEmail, name);

                // Create club interests
                const clubInterests = await interests.createClubInterestsMiddleware(interestArray, name);
        
                res.status(200).json({ message: 'Club created successfully' }); // Send success response
                console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
            }
            catch (err) { // Error handling
                if (err.message.includes('Unauthorized')) {
                    res.status(403).json({
                        status: "fail",
                        message: err.message,
                        description: `Unauthorized: ${req.session.email} is not an account`
                    });
                } else if (err.message.includes('Bad Request')) {
                    res.status(400).json({
                        status: "fail",
                        message: err.message,
                        description: `Bad Request: Failed to create club`
                    });
                } else {
                    res.status(500).json({
                        status: "fail",
                        message: err.message,
                        description: `Bad Request: Server Error`
                    });
                    console.log(`${req.sessionID} - Server Error: ${err}`)
                }
            }

        });

    } catch (err) { // Catching synchronous errors

        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
        console.log(`${req.sessionID} - Server Error: ${err}`)
        
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};
