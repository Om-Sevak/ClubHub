/*
----
Core Feature(s): Interests Management Middleware
Expected Input Type: Body (JSON), URL (string)
Expected Input: Interests (array of strings), Club Name (string), User Object ID (string), Email (string)
Expected Output Structure: Array of strings (interest names) or None
Expected Errors: Throws an error with appropriate message
Purpose: This file contains middleware functions for managing interests related to clubs and users. It includes functions for creating, editing, and retrieving interests associated with clubs and users. Additionally, it provides functionality for uploading images to Azure Blob Storage.
----
*/


const Club = require('../models/clubModel');
const Interest = require('../models/interestModel');
const ClubInterest = require('../models/clubInterestsModel');
const UserInterest = require('../models/userInterestsModel');
const User = require('../models/userModel');
const HttpError = require('../error/HttpError');
const handleError = require('../error/handleErrors');

/*
----
Core Feature(s): Create Club Interests Middleware
Expected Input Type: Body (JSON)
Expected Input: Interests (array of strings), Club Name (string)
Expected Output Structure: None
Expected Errors: Throws an error with appropriate message
Purpose: This middleware creates club interests by associating interests with a specific club.
----
*/

exports.createClubInterestsMiddleware = async (interests, clubName) => {
    try {

        // Find the club by id
        const club = await Club.findOne({ name: clubName })

        // Check if club exists
        if (!club) {
            return;
        }

        //Create the interests
        interests.forEach(async item => {
            const interest = await Interest.findOne({name: item});

            if (!interest) {
                return;
            }

            const clubInterest = await ClubInterest.create({club: club._id, interest: interest._id});
        })

    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

/*
----
Core Feature(s): Get User Interests Middleware
Expected Input Type: URL (string)
Expected Input: User Object ID (string)
Expected Output Structure: Array of strings (interest names)
Expected Errors: Throws an error with appropriate message
Purpose: This middleware retrieves the interests of a user based on their user object ID.
----
*/


exports.getUserInterestsMiddleware = async (userObjectId) => {
    try {
        const usersInterests = await UserInterest.find({user:userObjectId});
        const userInterestObjectIds = usersInterests.map(usersInterest => usersInterest.interest.toString());

        const interests = await Interest.find({ '_id': { $in: userInterestObjectIds}});

        return interests.map(interest => interest.name);
    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
}

/*
----
Core Feature(s): Create User Interests Middleware
Expected Input Type: Body (JSON)
Expected Input: Interests (array of strings), Email (string)
Expected Output Structure: None
Expected Errors: Throws an error with appropriate message
Purpose: This middleware creates user interests by associating interests with a specific user.
----
*/


exports.createUserInterestsMiddleware = async (interests, email) => {
    try {

        // Find the user by id
        const user = await User.findOne({ email: email })

        // Check if user exists
        if (!user) {
            console.log(`User does not exists to add interests to`);
            return;
        }

        //Create the interests
        interests.forEach(async item => {
            const interest = await Interest.findOne({name: item});

            if (!interest) {
                return;
            }

            const clubInterest = await UserInterest.create({user: user._id, interest: interest._id});
        })


    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}
/*
----
Core Feature(s): Edit Club Interests Middleware
Expected Input Type: Body (JSON)
Expected Input: New Interests (array of strings), Club Name (string)
Expected Output Structure: None
Expected Errors: Throws an error with appropriate message
Purpose: This middleware edits club interests by adding new interests and removing existing ones.
----
*/

exports.editClubInterestsMiddleware = async (newInterests, clubName) => {
    try {

        // Find the club by id
        const club = await Club.findOne({ name: clubName })

        // Check if club exists
        if (!club) {
            return;
        }

        //Get new of exisiting interests
        const currentClubInterests = await ClubInterest.find({club: club._id});

        //Add new interests
        for (const item of newInterests) {

            const interest = await Interest.findOne({name: item});

            if (!interest) {
                return;
            }
            const clubInterestExist = await ClubInterest.findOne({club: club._id, interest: interest._id});

            if (!clubInterestExist) {
                const newClubInterest = await ClubInterest.create({club: club._id, interest: interest._id});

            }
        }

        //Delete removed interests
        for (const interest of currentClubInterests) {
            const interestName = await Interest.findOne({_id: interest.interest});

            if (!newInterests.includes(interestName.name)) {
                const deleteStatus = await ClubInterest.deleteOne({club: club._id, interest: interest.interest});
                if (!deleteStatus.acknowledged) {
                    throw err;
                }
            }
        }
    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

/*
----
Core Feature(s): Get All Interests
Expected Input Type: None
Expected Input: None
Expected Output Structure: Array of strings (interest names)
Expected Errors: Throws an error with appropriate message
Purpose: This function retrieves all available interests.
----
*/


exports.getAllInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get all the available interests`);

        const interests = await Interest.find({});

        const interestNames = []
        interests.forEach(interest => {
            interestNames.push(interest.name)
        })

        res.status(200).json({ interests: interestNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
}

/*
----
Core Feature(s): Get Club Interests
Expected Input Type: URL (string)
Expected Input: Club Name (string)
Expected Output Structure: Array of strings (interest names)
Expected Errors: Throws an error with appropriate message
Purpose: This function retrieves the interests associated with a specific club.
----
*/


exports.getClubInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get club Intrests for club ${req.params.name}`);

        const club = await Club.findOne({ name: req.params.name });

        if (!club) {
            throw new HttpError(404,'Not Found: Fail to edit club as DNE');
        }

        const interests = await ClubInterest.find({club: club._id});

        const interestNames = []
        for (const interest of interests) {
            const interestDocument = await Interest.findOne({_id: interest.interest});
            interestNames.push(interestDocument.name);
        }

        res.status(200).json({ interests: interestNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
}

/*
----
Core Feature(s): Get User Interests
Expected Input Type: None
Expected Input: None
Expected Output Structure: Array of strings (interest names)
Expected Errors: Throws an error with appropriate message
Purpose: This function retrieves the interests of the current user.
----
*/

exports.getUserInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get user Intrests`);

        if (!req.session.email) {
            throw new  HttpError(401,'Unauthorized: Need to be logged in to get user interests');
        }

        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new  HttpError(404,'Not Found: Fail to get interest as user DNE');
        }

        const interestsNames = await exports.getUserInterestsMiddleware(user._id);

        res.status(200).json({ interests: interestsNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
}

/*
----
Core Feature(s): Edit User Interests
Expected Input Type: Body (JSON)
Expected Input: Interests (array of strings)
Expected Output Structure: None
Expected Errors: Throws an error with appropriate message
Purpose: This function allows the current user to edit their interests.
----
*/

exports.editUserInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit user Intrests`);

        if (!req.session.email) {
            throw new HttpError(401,'Unauthorized: Need to be logged in to edit user interests');
        }

        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new HttpError(404,'Not Found: Fail to edit user as DNE');
        }

        const interests = req.body.interests;

        //check if valid length
        if (interests.length < 3) {
            throw new  HttpError(400,'Invalid Interests: User must have at least 3 interests');
        }

        //Check if interests are valid
        const validInterests = await Interest.find({name: { $in: interests }});

        if (validInterests.length !== interests.length) {
            throw new HttpError(400,'Invalid Interests: Some interests do not exist');
        }

        //Delete old interests
        const deleteStatus = await UserInterest.deleteMany({ user: user._id });
        if (!deleteStatus.acknowledged) {
            throw new HttpError(400,'Bad Request: Failed to delete interests.');
        }

        this.createUserInterestsMiddleware(interests, req.session.email);

        res.status(200).json({ interests: interests });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
}
