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

const MAX_INTERESTS_PER_CLUB = 5

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

                const interestArray = interest.split(",");
                if (interestArray.length < MAX_INTERESTS_PER_CLUB){
                    throw new Error('Bad Request: Please select at least 3 interests');
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

    } catch (err) {

        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
        console.log(`${req.sessionID} - Server Error: ${err}`)
        
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.getClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request Get on ${ req.params.name}`);
        
        const club = await Club.findOne({ name: req.params.name });

        if (!club) {
            throw new Error('Not Found: Fail to edit club as DNE');
        }
        res.status(200).json({
            name: club.name,
            email: club.email,
            description: club.description,
            executives: club.executives,
            message: "Club Found Succesfully"
        });
        
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit club as ${req.params.name} DNE`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.editClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit club ${ req.params.name}. Changes: ${JSON.stringify(req.body)}`);
        const { name, description, email } = req.body;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Bad Request: Invalid email format');
        }

        if (name !== req.params.name) {
            const newClub = await Club.findOne({ name: name });
            if (newClub) {
                throw new Error(`Bad Request: club with name ${name} already exists`);
            }
        }
        
        // Checking if club exists first as we need a valid club to get possible role
        const club = await Club.findOne({ name: req.params.name });  
        if (!club) {
            throw new Error('Not Found: Fail to edit club as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to edit a club');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can modify the club.');
        }
        
        const updateStatus = await Club.updateOne({ name: req.params.name },req.body);
        if (!updateStatus.acknowledged) {
            throw err;
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
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Bad Request')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Failed to edit club`
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit club as ${req.params.name} DNE`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.deleteClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete club ${ req.params.name}`);
        // Checking if club exists first as we need a valid club to get possible role
        const club = await Club.findOne({ name: req.params.name }); 
         if (!club) {
            throw new Error('Not Found: Fail to delete club as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete a club');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete the club.');
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
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to delete club as ${req.params.name} DNE`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

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
        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`,
        });
        console.log(`${req.sessionID} - Server Error: ${err}`)
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.getClubsBrowse = async(req, res) => {
    try {
            console.log(`${req.sessionID} - Request for Clubs to browse on ${ JSON.stringify(req.body)}`);

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
              
            var clubs = await Club.aggregate(aggregationPipeline);

            clubs.forEach(club => {
                club.interests = club.interests
                  .flat();
              });

            if (req.session.isLoggedIn) {
                const userEmail = req.session.email
                const user = await User.findOne({ email: userEmail });
                const userObjectId = user._id;
                
                const clubMemberships = await ClubMembership.find({user:userObjectId});
                const joinedClubsObjectIds = clubMemberships.length > 0 ? clubMemberships.map(joinedClub => joinedClub.club.toString()):[];
                clubs.forEach(club => {
                    club["isJoined"] = joinedClubsObjectIds.includes(club._id.toString());
                })

                const userInterestsStringList = await interests.getUserInterestsMiddleware(userObjectId);
                clubs.forEach(club => {
                    
                    var finalInterests = [];
                    const diffInterests = [];

                    const clubsInterestsString = club.interests.map(interest => interest.name)
                    for (const interest of clubsInterestsString) {
                        if(userInterestsStringList.includes(interest)) {
                            finalInterests.push(interest);
                        } else {
                            diffInterests.push(interest);
                        }
                    }

                    const requiredOtherInterests = MAX_INTERESTS_PER_CLUB - finalInterests.length;
                    const matchingPercent = club.interests.length > 0 ? finalInterests.length/club.interests.length:0;
                    
                    if(requiredOtherInterests > 0) {
                        const chosenInterests = utils.getRandomElements(diffInterests,requiredOtherInterests);
                        finalInterests = finalInterests.concat(chosenInterests);
                    } else if (requiredOtherInterests < 0) {
                        finalInterests =  utils.getRandomElements(finalInterests,MAX_INTERESTS_PER_CLUB);
                    }

                    club.interests = finalInterests;
                    club["percentMatch"] = Math.floor(matchingPercent*100);
                })

                const joinedClubs = clubs.filter(club => club.isJoined);
                const randomizedJoinedClubs = utils.getRandomElements(joinedClubs,joinedClubs.length);

                var recommendedClubs = clubs.filter(club => club.percentMatch > 0 && !club.isJoined);
                if(recommendedClubs.length > 0) {
                    recommendedClubs.sort((clubA, clubB) => clubB.percentMatch - clubA.percentMatch);
                }

                const otherClubs = clubs.filter(club => !club.isJoined && club.percentMatch == 0);
                const randomizedOtherClubs = utils.getRandomElements(otherClubs,otherClubs.length);

                const allReturnedClubs = includeJoined ? 
                randomizedJoinedClubs.concat(recommendedClubs).concat(randomizedOtherClubs) :
                recommendedClubs.concat(otherClubs);
                
                clubs = allReturnedClubs.slice(0,limit);
            } else {
                clubs = utils.getRandomElements(clubs,clubs.length);
            }

            res.status(200).json({
                clubs: clubs,
                message: "Clubs Found Succesfully"
            });
            
            console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    
        } catch (err) {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`)
            console.log(`${req.sessionID} - Request Failed: ${err.message}`);
        }
};