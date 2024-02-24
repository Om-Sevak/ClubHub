const Club = require("../models/clubModel");
const Event = require("../models/clubEventModel");
const clubRole = require("./clubroleController");

exports.createEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create an event. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location, clubName } = req.body;

        const club = await Club.findOne({ name: clubName });
        if (!club) {
            throw new Error('Club Not Found: Fail to create event as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to add event');
        }
        
        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can add events');
        }

        const clubObjectId = club._id;

        // Create the event
        const newEvent = await Event.create({
            title: title,
            description: description,
            date: date,
            location: location,
            club: clubObjectId
        });

        res.status(200).json({ message: 'Event created successfully'});
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not and admin of club ${req.params.name}`,
            });
        } else if (error.message === 'Not Found') {
            res.status(404).json({
                status: 'fail',
                message: err.message,
                description: `Club ${clubName} does not exist`
            });
        } else {
            res.status(500).json({
                status: 'fail',
                message: 'An error occurred while processing your request',
                description: 'Server Error'
            });
            console.error(`${req.sessionID} - Server Error: ${error}`);
        }
        console.log(`${req.sessionID} - Request Failed: ${error.message}`);
    }
};
