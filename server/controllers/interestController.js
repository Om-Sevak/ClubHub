const Club = require('../models/clubModel');
const Interest = require('../models/interestModel');
const ClubInterest = require('../models/clubInterestsModel');

exports.createClubInterestsMiddleware = async (interests, clubName) => {
    try {

        // Find the club by id (in the request)
        const club = await Club.findOne({ name: clubName })

        // Check if user exists
        if (!club) {
            return;
        }

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