/*
Core Feature(s): Event Management
Expected Input Type: (body or URL)
Expected Input: (req.body)
    - title: String (Title of the event)
    - description: String (Description of the event)
    - date: Date (Date of the event)
    - location: String (Location of the event)
    - clubName: String (Name of the club associated with the event)
Expected Output Structure: JSON response with appropriate status code and message
Expected Errors: Error message if there is an issue creating, getting, editing, or deleting events
Purpose: Allows users to create, get, edit, and delete events associated with clubs.
*/

const Club = require("../models/clubModel");
const Event = require("../models/clubEventModel");
const User = require("../models/userModel");
const ClubMembership = require("../models/clubMembershipsModel");
const utils = require("../utils/utils");
const clubRole = require("./clubroleController");

//// Function to create a new event
exports.createEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create an event. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location, clubName } = req.body;

        const club = await Club.findOne({ name: req.params.name });
        if (!club) {
            throw new Error('Not Found: Fail to create event as club DNE');
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

        res.status(200).json({ message: 'Event created successfully' });
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
                status: 'fail',
                message: err.message,
                description: `Club ${req.params.name} does not exist`
            });
        } else {
            res.status(500).json({
                status: 'fail',
                message: 'An error occurred while processing your request',
                description: 'Server Error'
            });
            console.error(`${req.sessionID} - Server Error: ${err}`);
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

//Function to retrieve all events for a club
exports.getEventsForClub = async (req, res) => {
    try {
        // Find all events for the given clubId
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.name}`);

        const club = await Club.findOne({ name: req.params.name });
        if (!club) {
            throw new Error('Not Found: Fail to get events as club DNE');
        }
        const clubObjectId = club._id;
        const events = await Event.find({ club: clubObjectId });

        res.status(200).json({
            events: events,
            message: "Events found successfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get events as ${req.params.name} DNE`,
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

// Function to retrieve a specific event
exports.getEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.event}`);

        const event = await Event.findOne({ _id: req.params.event });

        if (!event) {
            throw new Error('Not Found: Fail to get event as event DNE');
        }


        res.status(200).json({
            title: event.title,
            date: event.date,
            description: event.description,
            location: event.location,
            message: "Club Found Succesfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to get event as ${req.params.name} DNE`,
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
}

//Function to edit an event
exports.editEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit event ${req.params.event}. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location } = req.body;

        // Checking if club exists first as we need a valid club to get possible role
        const event = await Event.findOne({ _id: req.params.event });
        if (!event) {
            throw new Error('Not Found: Fail to edit event as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to edit a club');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can modify the club.');
        }

        const updateStatus = await Event.updateOne({ _id: req.params.event }, req.body);
        if (!updateStatus.acknowledged) {
            throw err;
        }

        res.status(201).json({
            status: "success",
            message: "event modified",
            data: {
                event: event,
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
                description: `Bad Request: Failed to edit event`
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to edit event as ${req.params.event} DNE`,
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

//Function to delete an event
exports.deleteEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete event ${req.params.event}`);

        // Find the event by its ID
        const event = await Event.findOne({ _id: req.params.event });
        if (!event) {
            throw new Error('Not Found: Event does not exist');
        }

        // Check if the user is authorized to delete the event
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete an event');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete events');
        }

        // Delete the event
        await Event.deleteOne({ _id: req.params.event });

        res.status(200).json({
            status: "success",
            message: "Event deleted successfully",
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: ${req.session.email} is not an admin of club ${req.params.name}`,
            });
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to delete event as ${req.params.event} does not exist`,
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

//Function to retrieve events for browsing
exports.getEventsBrowse = async (req, res) => {
    try {
        console.log(`${req.sessionID} - Request for Events to browse on ${JSON.stringify(req.body)}`);

        const body = JSON.parse(JSON.stringify(req.body));

        const { limit, includeJoined } = body;

        const aggregationPipeline = [
            {
                $lookup: {
                    from: 'clubs', // Collecttion name for clubs
                    localField: 'club',
                    foreignField: '_id',
                    as: 'club_info'
                }
            },
            {
                $unwind: '$club_info'
            },
            {
                $lookup: {
                    from: 'clubinterests', // Collection name for clubinterests
                    localField: 'club',
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
                    title: { $first: '$title' },
                    description: { $first: '$description' },
                    date: { $first: '$date' },
                    location: { $first: '$location' },
                    club: { $first: '$club_info'},
                    interests: { $push: '$interests' }
                }
            },
            
        ];

        // perform aggregate mongo call
        var events = await Event.aggregate(aggregationPipeline);

        // format each dictionary for easier reading
        events.forEach(event => {
            event["clubName"] = event.club.name;
            event["imgUrl"] = event.club.imgUrl;
            event.club = event.club._id;
            event.interests = event.interests.flat();
            event.interests = event.interests.map(interest => interest.name);
        });

         // if user is logged in 
        if (req.session.isLoggedIn) {
            // get user info
            const userEmail = req.session.email
            const user = await User.findOne({ email: userEmail });
            const userObjectId = user._id;

            // used also by posts
            events = await utils.orderClubs(events, userObjectId, includeJoined)
        } else {
            // .getRandomElements directly modifies the list, it does not return a copy unless we modify the length
            utils.getRandomElements(events,events.length);
        }

        if (limit > 0) {
            events = events.slice(0,limit);
        }
        
        res.status(200).json({
            events: events,
            message: "Events Found Succesfully"
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

//// Function to retrieve all upcoming events
exports.getAllEvents = async (req, res) => {
    try {
      console.log(`${req.sessionID} - ${req.session.email} is requesting to get all events`);
      const currentDate = new Date();

      const events = await Event.find({ 
        date: { $gte: currentDate } 
    })
    .populate({
        path: 'club',
        select: 'name imgUrl', 
    })
    .sort({ date: 'asc' });
    
  
      res.status(200).json({
        events: events,
        message: "Events found successfully"
      });
  
      console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
      res.status(500).json({
        status: "fail",
        message: err.message,
        description: `Bad Request: Server Error`,
      });
      console.log(`${req.sessionID} - Server Error: ${err}`);
    }
  };

  //// Function to retrieve events for a specific user
exports.getEventsForUser = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} requesting GET clubs and events for user with ID: ${req.params.userId}`);

        const user = await User.findOne({ email: req.session.email });
        const clubMemberships = await ClubMembership.find({ user: user }).populate('club');

        const clubIds = clubMemberships.map(membership => membership.club._id);

        const currentDate = new Date();
        const events = await Event.find({ 
            club: { $in: clubIds },
            date: { $gte: currentDate } 
        })
        .populate({
            path: 'club',
            select: 'name imgUrl', 
        })
        .sort({ date: 'asc' });


        res.status(200).json({
            events: events,
            message: "events found successfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        console.error(`${req.sessionID} - Request Failed: ${err.message}`);

        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`
        });
    }
};