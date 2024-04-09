/*
Core Feature(s): Club Interests Middleware
Expected Input Type: body or URL (depending on the function)
Expected Input: Object containing interests array and club/user name/email.
Expected Output Structure: JSON object containing a success message or error message.
Expected Errors: Error message if club/user doesn't exist, interest doesn't exist, or if there is a server error.
Purpose: Middleware functions to manage club and user interests, including creation, editing, and retrieval.
*/


const Club = require('../models/clubModel');
const Interest = require('../models/interestModel');
const ClubInterest = require('../models/clubInterestsModel');
const UserInterest = require('../models/userInterestsModel');
const User = require('../models/userModel');

// Middleware function to create club interests
exports.createClubInterestsMiddleware = async (interests, clubName) => {
    try {
        // Find the club by name
        const club = await Club.findOne({ name: clubName });

        // Check if club exists
        if (!club) {
            return;
        }

        // Create interests
        interests.forEach(async item => {
            const interest = await Interest.findOne({ name: item });

            if (!interest) {
                return;
            }

            const clubInterest = await ClubInterest.create({ club: club._id, interest: interest._id });
        });

    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
};

// Middleware function to retrieve user interests
exports.getUserInterestsMiddleware = async (userObjectId) => {
    try {
        const usersInterests = await UserInterest.find({ user: userObjectId });
        const userInterestObjectIds = usersInterests.map(usersInterest => usersInterest.interest.toString());

        const interests = await Interest.find({ '_id': { $in: userInterestObjectIds } });

        return interests.map(interest => interest.name);
    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
};

// Middleware function to create user interests
exports.createUserInterestsMiddleware = async (interests, email) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        // Check if user exists
        if (!user) {
            console.log(`User does not exist to add interests to`);
            return;
        }

        // Create interests
        interests.forEach(async item => {
            const interest = await Interest.findOne({ name: item });

            if (!interest) {
                return;
            }

            const clubInterest = await UserInterest.create({ user: user._id, interest: interest._id });
        });

    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
};

// Middleware function to edit club interests
exports.editClubInterestsMiddleware = async (newInterests, clubName) => {
    try {
        // Find the club by name
        const club = await Club.findOne({ name: clubName });

        // Check if club exists
        if (!club) {
            return;
        }

        // Get existing interests
        const currentClubInterests = await ClubInterest.find({ club: club._id });

        // Add new interests
        for (const item of newInterests) {
            const interest = await Interest.findOne({ name: item });

            if (!interest) {
                return;
            }
            const clubInterestExist = await ClubInterest.findOne({ club: club._id, interest: interest._id });

            if (!clubInterestExist) {
                const newClubInterest = await ClubInterest.create({ club: club._id, interest: interest._id });
            }
        }

        // Delete removed interests
        for (const interest of currentClubInterests) {
            const interestName = await Interest.findOne({ _id: interest.interest });

            if (!newInterests.includes(interestName.name)) {
                const deleteStatus = await ClubInterest.deleteOne({ club: club._id, interest: interest.interest });
                if (!deleteStatus.acknowledged) {
                    throw err;
                }
            }
        }

    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
};

// Middleware function to get all available interests
exports.getAllInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get all available interests`);

        const interests = await Interest.find({});

        const interestNames = [];
        interests.forEach(interest => {
            interestNames.push(interest.name);
        });

        res.status(200).json({ interests: interestNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

// Middleware function to get club interests
exports.getClubInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get club interests for club ${req.params.name}`);

        const club = await Club.findOne({ name: req.params.name });

        if (!club) {
            throw new Error('Not Found: Failed to get club interests as club does not exist');
        }

        const interests = await ClubInterest.find({ club: club._id });

        const interestNames = [];
        for (const interest of interests) {
            const interestDocument = await Interest.findOne({ _id: interest.interest });
            interestNames.push(interestDocument.name);
        }

        res.status(200).json({ interests: interestNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Failed to get club interests as ${req.params.name} does not exist`,
            });
        }
        else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`
            });
        }

        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

// Middleware function to get user interests
exports.getUserInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get user interests`);

        if (!req.session.email) {
            throw new Error('Unauthorized: Need to be logged in to get user interests');
        }

        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new Error('Not Found: Failed to get user interests as user does not exist');
        }

        const interestsNames = await exports.getUserInterestsMiddleware(user._id);

        res.status(200).json({ interests: interestsNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Failed to get user interests as ${req.session.email} does not exist`,
            });
        } else if (err.message.includes('Unauthorized')) {
            res.status(401).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: Failed to be logged in`,
            });
        }
        else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`
            });
        }

        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

// Middleware function to edit user interests
exports.editUserInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit user interests`);

        if (!req.session.email) {
            throw new Error('Unauthorized: Need to be logged in to edit user interests');
        }

        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new Error('Not Found: Failed to edit user interests as user does not exist');
        }

        const interests = req.body.interests;

        // Check if valid length
        if (interests.length < 3) {
            throw new Error('Invalid Interests: User must have at least 3 interests');
        }

        // Check if interests are valid
        const validInterests = await Interest.find({ name: { $in: interests } });

        if (validInterests.length !== interests.length) {
            throw new Error('Invalid Interests: Some interests do not exist');
        }

        // Delete old interests
        const deleteStatus = await UserInterest.deleteMany({ user: user._id });
        if (!deleteStatus.acknowledged) {
            throw err;
        }

        this.createUserInterestsMiddleware(interests, req.session.email);

        res.status(200).json({ interests: interests });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Failed to edit user interests as ${req.session.email} does not exist`,
            });
        }
        else if (err.message.includes('Invalid Interests')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Some interests do not exist`
            });
        } else if (err.message.includes('Unauthorized')) {
            res.status(401).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: Failed to be logged in`,
            });
        }
        else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`
            });
        }

        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};
