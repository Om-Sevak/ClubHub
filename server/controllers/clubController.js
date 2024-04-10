/*
----
Core Feature(s): Club Management
Expected Input Type: (body, file, URL parameters)
Expected Input: Club details, including name, description, email, interest, and optional club logo image, for creation, editing, deletion; Club name for retrieval; Search query for searching; Body parameters for browsing
Expected Output Structure: JSON objects with relevant club details, messages confirming actions, or error details
Expected Errors: Unauthorized, Bad Request, Not Found, Internal Server Error
Purpose: This file contains controller functions for managing clubs, including creation, retrieval, editing, deletion, searching, and browsing. It handles user authentication, input validation, file uploads, and database operations related to clubs and their associated data.
----
*/



const Club = require("../models/clubModel");
const User = require("../models/userModel")
const ClubMembership = require('../models/clubMembershipsModel');
const ClubPost = require('../models/clubPostModel');
const ClubEvent = require('../models/clubEventModel');
const ClubInterest = require('../models/clubInterestsModel');
const HttpError = require('../error/HttpError');
const handleError = require('../error/handleErrors');
const interests = require("./interestController")
const clubRole = require("./clubroleController");
const utils = require("../utils/utils");
const uploadImage = require("./imgUploadController");
const multer = require('multer');

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const MAX_INTERESTS_PER_CLUB = 5

/*
----
Core Feature(s): Club Creation
Expected Input Type: (body, file)
Expected Input: Club details including name, description, email, interest, and an optional club logo image
Expected Output Structure: JSON object with message confirming club creation
Expected Errors: Unauthorized, Bad Request, Internal Server Error
Purpose: This function allows a logged-in user to create a new club. It validates user authentication, checks for existing clubs with the same name, validates email format, and ensures at least 5 interests are selected for the club. It also handles club logo image uploads.
----
*/

exports.createClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create club. Changes: ${JSON.stringify(req.body)}`);
    
        //const executives = [];

        upload.single('image')(req, res, async (err) => {

            const body = JSON.parse(JSON.stringify(req.body));
            const { name, description, email, interest } = body;

            if (err) {
                console.error('Error uploading profile picture:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            try {

                if (!req.session.isLoggedIn) {
                    throw new HttpError(403,'Unauthorized: Must sign in to create a club');
                }
        
                // Validate that a club with the provided name doesn't already exist
                const club = await Club.findOne({ name: name });
                if (club) {
                    throw new  HttpError(400,`Bad Request: Club called ${name} already exists`);
                }
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new  HttpError(400,'Bad Request: Invalid email format');
                }

                const interestArray = interest.split(",");
                if (interestArray.length < MAX_INTERESTS_PER_CLUB){
                    throw new  HttpError(400,'Bad Request: Please select at least 5 interests');
                }
        
                const userEmail = req.session.email
                const user = await User.findOne({ email: userEmail });
                const userObjectId = user._id;

                // Handle image upload
                let imageUrl = '';
                //If image is uploaded, upload to Azure Blob Storage
                //If not, use default image
                if (req.file){
                    //Azure Blob Storage configuration
                    const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
                    const CONTAINER_NAME = process.env.CONTAINER_NAME;
                    //getting image buffer and type
                    const imageBuffer = req.file.buffer;
                    const imageType = req.file.mimetype;
                   
                    imageUrl = await uploadImage(imageBuffer, imageType, AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME);
                } else{
                     imageUrl = process.env.DEFAULT_LOGO_URL; 
                }

                console.log(`${req.sessionID} - ${req.session.email} uploaded a club logo.`);

                const newClub = await Club.create({
                    name: name,
                    description: description,
                    email: email,
                    createdBy: userObjectId,
                    imgUrl: imageUrl
                });
        
                const adminRole = await clubRole.createAdminRoleMiddleware(userEmail, name);

                const clubInterests = await interests.createClubInterestsMiddleware(interestArray, name);
        
                res.status(200).json({ message: 'Club created successfully' });
                console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
            }
            catch (err) {
                handleError.returnError(err, req.sessionID, res);
            }
            });

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};
/*
----
Core Feature(s): Club Retrieval
Expected Input Type: (URL parameters)
Expected Input: Club name
Expected Output Structure: JSON object with club details
Expected Errors: Not Found, Server Error
Purpose: This function retrieves details of a specific club using its name.
----
*/

exports.getClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request Get on ${ req.params.name}`);
        
        const club = await Club.findOne({ name: req.params.name });

        if (!club) {
            throw new HttpError(404,'Not Found: Fail to get club as DNE');
        }
        res.status(200).json({
            name: club.name,
            email: club.email,
            description: club.description,
            executives: club.executives,
            imgUrl: club.imgUrl,
            message: "Club Found Succesfully"
        });
        
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Club Editing
Expected Input Type: (body, file, URL parameters)
Expected Input: Club name, updated club details including name, description, email, interest, and an optional club logo image
Expected Output Structure: JSON object with message confirming club modification
Expected Errors: Unauthorized, Bad Request, Internal Server Error
Purpose: This function allows an admin user to edit the details of an existing club. It validates user authentication, checks for existing clubs with the same name (if name is changed), ensures at least 5 interests are selected for the club, and handles club logo image uploads.
----
*/

exports.editClub = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit club ${req.params.name}. Changes: ${JSON.stringify(req.body)}`);


        upload.single('image')(req, res, async (err) => {

            const body = JSON.parse(JSON.stringify(req.body));
            const { name, description, email, interest } = body;
            let interestsArray = [];
            if(interest){
                interestsArray = interest.split(",");
            }

            if (err) {
                console.error('Error uploading profile picture:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }
            try {
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    throw new HttpError(400,'Bad Request: Invalid email format');
                }

                if (name !== req.params.name) {
                    const newClub = await Club.findOne({ name: name });
                    if (newClub) {
                        throw new HttpError(400,`Bad Request: club with name ${name} already exists`);
                    }
                }

                // Checking if club exists first as we need a valid club to get possible role
                const club = await Club.findOne({ name: req.params.name });
                if (!club) {
                    throw new HttpError(404,'Not Found: Fail to edit club as DNE');
                }

                if (!req.session.isLoggedIn) {
                    throw new HttpError(403,'Unauthorized: Must sign in to edit a club');
                }

                const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
                if (!isAdmin) {
                    throw new HttpError(403,'Unauthorized: Only admins can modify the club.');
                }

                if (interestsArray.length < 5) {
                    throw new HttpError(400,'Bad Request: Please select at least 5 interests');
                }

                 // Handle image upload
                 //If image is uploaded, upload to Azure Blob Storage
                 //If not, use default image
                 if (req.file){
                     //Azure Blob Storage configuration
                     const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
                     const CONTAINER_NAME = process.env.CONTAINER_NAME;
                     //getting image buffer and type
                     const imageBuffer = req.file.buffer;
                     const imageType = req.file.mimetype;
                    
                     body["imgUrl"] = await uploadImage(imageBuffer, imageType, AZURE_STORAGE_CONNECTION_STRING, CONTAINER_NAME);
                 } else if (!club.imgUrl) {
                    body["imgUrl"]  = process.env.DEFAULT_LOGO_URL; 
                 }


                const updateStatus = await Club.updateOne({ name: req.params.name }, body);
                if (!updateStatus.acknowledged) {
                    throw err;
                }
                if(updateStatus.acknowledged){
                    const editClubInterest = await interests.editClubInterestsMiddleware(interestsArray, req.params.name);
                }
                

                res.status(201).json({
                    status: "success",
                    message: "club modified",
                    data: {
                        club: club,
                    },
                });
                console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);


            } catch (err) {
                handleError.returnError(err, req.sessionID, res);
            }

        });
    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Club Deletion
Expected Input Type: (URL parameters)
Expected Input: Club name
Expected Output Structure: JSON object with message confirming club deletion
Expected Errors: Not Found, Unauthorized, Server Error
Purpose: This function allows an admin user to delete an existing club. It validates user authentication and admin status, deletes associated data (membership, posts, events, interests), and then deletes the club.
----
*/

exports.deleteClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete club ${ req.params.name}`);
        // Checking if club exists first as we need a valid club to get possible role
        const club = await Club.findOne({ name: req.params.name }); 
         if (!club) {
            throw new HttpError(404,'Not Found: Fail to delete club as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to delete a club');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new  HttpError(403,'Unauthorized: Only admins can delete the club.');
        }

        await Promise.all([
            ClubMembership.deleteMany({ club: club._id }),
            ClubPost.deleteMany({ club: club._id }),
            ClubEvent.deleteMany({ club: club._id }),
            ClubInterest.deleteMany({ club: club._id })
        ]);

        
        await club.deleteOne();

        res.status(200).json({
            status: "success",
            message: "club deleted",
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Club Search
Expected Input Type: (URL parameters)
Expected Input: Search query
Expected Output Structure: JSON object with array of club names matching the search query
Expected Errors: Server Error
Purpose: This function retrieves club names that match a given search query.
----
*/

exports.getClubs = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request Get on ${ req.params.query}`);
        
        const clubs = await Club.find({ name:  {$regex: `${req.params.query}`, $options: 'i'} });
        const clubsNames = clubs.map(club => club.name);

        res.status(200).json({
            names: clubsNames,
            message: "Clubs Found Succesfully"
        });
        
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Club Browsing
Expected Input Type: (body)
Expected Input: Object with properties like limit (optional) and includeJoined (optional)
Expected Output Structure: JSON object with array of clubs for browsing
Expected Errors: Server Error
Purpose: This function retrieves clubs for browsing, possibly with a limit and considering the user's joined clubs if available. It also calculates the percentage match of recommended clubs based on user interests.
----
*/

exports.getClubsBrowse = async (req, res) => {
    try {
        console.log(`${req.sessionID} - Request for Clubs to browse on ${JSON.stringify(req.body)}`);

        const body = JSON.parse(JSON.stringify(req.body));

        const { limit, includeJoined } = body;

        const aggregationPipeline = [
            {
                $lookup: {
                    from: 'clubinterests', // Collection name for clubinterests
                    localField: '_id',
                    foreignField: 'club',
                    as: 'club_interests'
                }
            },
            {
                $unwind: {
                    path: '$club_interests',
                    preserveNullAndEmptyArrays: true // Left outer join
                }
            },
            {
                $lookup: {
                    from: 'interests', // Collection name for interests
                    localField: 'club_interests.interest',
                    foreignField: '_id',
                    as: 'interests'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    description: { $first: '$description' },
                    imgUrl: { $first: '$imgUrl' },
                    interests: { $push: '$interests' }
                }
            }
        ];

        // perform aggregate mongo call
        var clubs = await Club.aggregate(aggregationPipeline);

        // format each dictionary for easier reading
        clubs.forEach(club => {
            club.interests = club.interests
                .flat();
            club.interests = club.interests.map(interest => interest.name);
        });

        // if user is logged in 
        if (req.session.isLoggedIn) {
            // get user info
            const userEmail = req.session.email
            const user = await User.findOne({ email: userEmail });
            const userObjectId = user._id;

            // find and demark clubs that are joined by user
            const clubMemberships = await ClubMembership.find({ user: userObjectId });
            const joinedClubsObjectIds = clubMemberships.map(joinedClub => joinedClub.club.toString());
            clubs.forEach(club => {
                club["isJoined"] = joinedClubsObjectIds.includes(club._id.toString());
            })

            // get user interests
            const userInterestsStringList = await interests.getUserInterestsMiddleware(userObjectId);
            
            // algorithm to get percentage match and format interests by random(matching) the fill last 5 with random(not matching)
            clubs.forEach(club => {

                const sameInterests = [];
                const diffInterests = [];

                // we define matching as interets in the club and user, non matching as those that exist in club but not user
                // ^ this means "not matching" is not bi-directional
                for (const interest of club.interests) {
                    if (userInterestsStringList.includes(interest)) {
                        sameInterests.push(interest);
                    } else {
                        diffInterests.push(interest);
                    }
                }

                // calculate percentage match and the required number of non matching interests to fill the required amount
                const requiredOtherInterests = MAX_INTERESTS_PER_CLUB - sameInterests.length;
                const matchingPercent = club.interests.length > 0 ? sameInterests.length / userInterestsStringList.length : 0;

                // randomized the matching interests, but also cut off some if needed
                var finalInterests = utils.getRandomElements(
                    sameInterests,
                    Math.min(MAX_INTERESTS_PER_CLUB, sameInterests.length))

                // fill in other required interests, randomizing their order
                if (requiredOtherInterests > 0) {
                    const chosenDiffInterests = utils.getRandomElements(diffInterests, requiredOtherInterests);
                    finalInterests = finalInterests.concat(chosenDiffInterests);
                }

                club.interests = finalInterests;
                club["percentMatch"] = Math.floor(matchingPercent * 100); // percentage
            })

            // .getRandomElements directly modifies the list, it does not return a copy unless we modify the length
            const joinedClubs = clubs.filter(club => club.isJoined);
            utils.getRandomElements(joinedClubs, joinedClubs.length);

            // we do not include joined clubs that are also recommended (they already appear!)
            var recommendedClubs = clubs.filter(club => club.percentMatch > 0 && !club.isJoined);
            if (recommendedClubs.length > 0) {
                recommendedClubs.sort((clubA, clubB) => clubB.percentMatch - clubA.percentMatch);
            }

            const otherClubs = clubs.filter(club => !club.isJoined && club.percentMatch == 0);
            utils.getRandomElements(otherClubs, otherClubs.length); // see comment above 

            // order is joined=>recommended=>other, though we don't always include joined
            const allReturnedClubs = includeJoined ?
                joinedClubs.concat(recommendedClubs).concat(otherClubs) :
                recommendedClubs.concat(otherClubs);

            clubs = allReturnedClubs;
        } else {
            utils.getRandomElements(clubs, clubs.length);
        }

        // limit as needed
        if (limit > 0) {
            clubs = clubs.slice(0, limit);
        }

        res.status(200).json({
            clubs: clubs,
            message: "Clubs Found Succesfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};