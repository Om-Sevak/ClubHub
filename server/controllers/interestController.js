const Club = require('../models/clubModel');
const Interest = require('../models/interestModel');
const ClubInterest = require('../models/clubInterestsModel');
const UserInterest = require('../models/userInterestsModel');
const User = require('../models/userModel');

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
        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
}

exports.getClubInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get club Intrests for club ${req.params.name}`);

        const club = await Club.findOne({ name: req.params.name });

        if (!club) {
            throw new Error('Not Found: Fail to edit club as DNE');
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
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit club as ${req.params.name} DNE`,
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
}

exports.getUserInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to get user Intrests`);

        if(!req.session.email) {
            throw new Error('Need to be logged in to get user interests');
        }

        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new Error('Not Found: Fail to get interest as user DNE');
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
                description: `Not Found: Fail to get interest as ${req.session.email} DNE`,
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
}  

// Edit user interests
exports.editUserInterests = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit user Intrests`);

        if(!req.session.email) {
            throw new Error('Need to be logged in to edit user interests');
        }

        const user = await User.findOne({ email: req.session.email });

        if (!user) {
            throw new Error('Not Found: Fail to edit user as DNE');
        }

        const interests = req.body.interests;

        //check if valid length
        if (interests.length < 3) {
            throw new Error('Invalid Interests: User must have at least 3 interests');
        }

        //Check if interests are valid
        const validInterests = await Interest.find({name: { $in: interests }});

        if (validInterests.length !== interests.length) {
            throw new Error('Invalid Interests: Some interests do not exist');
        }

        //Delete old interests
        const deleteStatus = await UserInterest.deleteMany({user: user._id});
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
                description: `Not Found: Fail to edit user as ${req.session.email} DNE`,
            });
        }
        else if (err.message.includes('Invalid Interests')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Some interests do not exist`
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
}
