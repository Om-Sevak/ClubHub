const Club = require("../models/clubModel");
const Event = require("../models/clubEventModel");

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, location, clubName } = req.body;

        // Check if the club exists
        const club = await Club.findOne({ name: clubName });
        if (!club) {
            return res.status(404).json({ message: "Club does not exist" });
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

        res.status(200).json({ message: 'Event created successfully', event: newEvent });
        
    } catch (error) {
        console.error('Event creation failed:', error);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
};
