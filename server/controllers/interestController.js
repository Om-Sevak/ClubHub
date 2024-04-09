
/*
----
Core Feature(s):
- Create Club Interests Middleware: Creates interests for a club.
- Get User Interests Middleware: Retrieves interests of a user.
- Create User Interests Middleware: Creates interests for a user.
- Edit Club Interests Middleware: Edits interests of a club.
- Get All Interests: Retrieves all available interests.
- Get Club/User Interests: Retrieves interests of a club/user.
- Edit User Interests: Edits interests of a user.
Expected Input: Various input types based on the middleware function.
Expected Output: Various output structures based on the middleware function.
Expected Errors: Various error types handled by each middleware function.
Purpose: Provides middleware functions for managing interests associated with clubs and users.
----
*/


const Club = require('../models/clubModel');
const Interest = require('../models/interestModel');
const ClubInterest = require('../models/clubInterestsModel');
const UserInterest = require('../models/userInterestsModel');
const User = require('../models/userModel');

// Middleware function to create interests for a club
exports.createClubInterestsMiddleware = async (interests, clubName) => {
    try {
        // Find the club by name
        const club = await Club.findOne({ name: clubName });

        // Check if club exists
        if (!club) {
            return;
        }

        // Create the interests
        interests.forEach(async item => {
            const interest = await Interest.findOne({ name: item });

            if (!interest) {
                return;
            }

            // Create club interest association
            const clubInterest = await ClubInterest.create({ club: club._id, interest: interest._id });
        });

    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
}

// Middleware function to retrieve interests of a user
exports.getUserInterestsMiddleware = async (userObjectId) => {
    try {
        // Find user's interests
        const usersInterests = await UserInterest.find({ user: userObjectId });
        const userInterestObjectIds = usersInterests.map(usersInterest => usersInterest.interest.toString());

        // Find interest names
        const interests = await Interest.find({ '_id': { $in: userInterestObjectIds } });

        return interests.map(interest => interest.name);
    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
}

// Middleware function to create interests for a user
exports.createUserInterestsMiddleware = async (interests, email) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });

        // Check if user exists
        if (!user) {
            console.log(`User does not exist to add interests to`);
            return;
        }

        // Create the interests
        interests.forEach(async item => {
            const interest = await Interest.findOne({ name: item });

            if (!interest) {
                return;
            }

            // Create user interest association
            const userInterest = await UserInterest.create({ user: user._id, interest: interest._id });
        });

    } catch (err) {
        console.log(`Server Error: ${err}`);
        return;
    }
}

// Middleware function to edit interests of a club
exports.editClubInterestsMiddleware = async (newInterests, clubName) => {
    try {
        // Find the club by name
        const club = await Club.findOne({ name: clubName });

        // Check if club exists
        if (!club) {
            return;
        }

        // Get current club interests
        const currentClubInterests = await ClubInterest.find({ club: club._id });

        // Add new interests
        for (const item of newInterests) {
            const interest = await Interest.findOne({ name: item });

            if (!interest) {
                return;
            }

            // Check if club already has the interest
            const clubInterestExist = await ClubInterest.findOne({ club: club._id, interest: interest._id });

            if (!clubInterestExist) {
                // Create club interest association
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
}

// Middleware function to retrieve all available interests
exports.getAllInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get all available interests`);

        // Find all interests
        const interests = await Interest.find({});

        // Extract interest names
        const interestNames = interests.map(interest => interest.name);

        res.status(200).json({ interests: interestNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}

// Middleware function to retrieve interests of a club
exports.getClubInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get club interests for club ${req.params.name}`);

        // Find the club by name
        const club = await Club.findOne({ name: req.params.name });

        if (!club) {
            throw new Error('Not Found: Fail to edit club as DNE');
        }

        // Find interests associated with the club
        const interests = await ClubInterest.find({ club: club._id });

        // Extract interest names
        const interestNames = [];
        for (const interest of interests) {
            const interestDocument = await Interest.findOne({ _id: interest.interest });
            interestNames.push(interestDocument.name);
        }

        res.status(200).json({ interests: interestNames });
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
                description: `Bad Request: Server Error`
            });
        }

        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}

// Middleware function to retrieve interests of a user
exports.getUserInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get user interests`);

        // Check if user is logged in
        if (!req.session.email) {
            throw new Error('Unauthorized: Need to be logged in to get user interests');
        }

        // Find the user by email
        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new Error('Not Found: Fail to get interest as user DNE');
        }

        // Get user's interests
        const interestsNames = await exports.getUserInterestsMiddleware(user._id);

        res.status(200).json({ interests: interestsNames });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get interest as ${req.session.email} DNE`,
            });
        } else if (err.message.includes('Unauthorized')) {
            res.status(401).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: Failed to be logged in`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`
            });
        }

        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}

// Middleware function to edit interests of a user
exports.editUserInterests = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit user interests`);

        // Check if user is logged in
        if (!req.session.email) {
            throw new Error('Unauthorized: Need to be logged in to edit user interests');
        }

        // Find the user by email
        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new Error('Not Found: Fail to edit user as DNE');
        }

        const interests = req.body.interests;

        // Check if the number of interests is valid
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

        // Create new interests for the user
        this.createUserInterestsMiddleware(interests, req.session.email);

        res.status(200).json({ interests: interests });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit user as ${req.session.email} DNE`,
            });
        } else if (err.message.includes('Invalid Interests')) {
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
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`
            });
        }

        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}
