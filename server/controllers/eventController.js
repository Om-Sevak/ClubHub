/*
----
Core Feature(s): Event Management, Club Authentication, Session Management
Expected Input Type: (body)
Expected Input: Depending on the function, input varies (e.g., createEvent requires event details like title, description, date, location, and clubName)
Expected Output Structure: JSON object with message and event details
Expected Errors: Various error responses including Bad Request, Unauthorized, Not Found, Server Error
Purpose: This file contains functions related to event management, including creating, editing, deleting, and retrieving events. It also includes functions for retrieving events for a specific club, user, or for browsing. Each function performs specific tasks related to event management, such as checking user authentication, club membership, and admin privileges before allowing actions like event creation or modification. The file also handles session management for authenticated users.
----
*/


const Club = require("../models/clubModel");
const Event = require("../models/clubEventModel");
const User = require("../models/userModel");
const ClubMembership = require("../models/clubMembershipsModel");
const HttpError = require('../error/HttpError');
const handleError = require('../error/handleErrors');
const utils = require("../utils/utils");
const clubRole = require("./clubroleController");

/*
----
Core Feature(s): Event Creation
Expected Input Type: (body)
Expected Input: Event details including title, description, date, location, and clubName
Expected Output Structure: JSON object with message confirming event creation
Expected Errors: Not Found, Unauthorized, Server Error
Purpose: This function creates a new event for a specified club. It validates the user's authentication status, checks if the user is an admin of the club, and then creates the event if all conditions are met.
----
*/

exports.createEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create an event. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location, clubName } = req.body;

        const club = await Club.findOne({ name: req.params.name });
        if (!club) {
            throw new HttpError(404,'Not Found: Fail to create event as club DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to add event');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new HttpError(403,'Unauthorized: Only admins can add events');
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
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Event Retrieval
Expected Input Type: (URL parameters)
Expected Input: Club name
Expected Output Structure: JSON object with events for the specified club
Expected Errors: Not Found, Server Error
Purpose: This function retrieves all events associated with a specific club. It checks if the club exists, then fetches the events belonging to that club.
----
*/

exports.getEventsForClub = async (req, res) => {
    try {
        // Find all events for the given clubId
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.name}`);

        const club = await Club.findOne({ name: req.params.name });
        if (!club) {
            throw new HttpError(404,'Not Found: Fail to get events as club DNE');
        }
        const clubObjectId = club._id;
        const events = await Event.find({ club: clubObjectId });

        res.status(200).json({
            events: events,
            message: "Events found successfully"
        });

        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Event Retrieval
Expected Input Type: (URL parameters)
Expected Input: Event ID
Expected Output Structure: JSON object with event details
Expected Errors: Not Found, Server Error
Purpose: This function retrieves details of a specific event using its ID.
----
*/
exports.getEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} requesting GET on ${req.params.event}`);

        const event = await Event.findOne({ _id: req.params.event });

        if (!event) {
            throw new HttpError(404,'Not Found: Fail to get event as event DNE');
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
        handleError.returnError(err, req.sessionID, res);
    }
}
/*
----
Core Feature(s): Event Editing
Expected Input Type: (body, URL parameters)
Expected Input: Event ID, updated event details (title, description, date, location)
Expected Output Structure: JSON object with message confirming event modification
Expected Errors: Not Found, Unauthorized, Bad Request, Server Error
Purpose: This function allows an admin user to edit the details of an existing event. It verifies the user's admin status for the club and updates the event details accordingly.
----
*/

exports.editEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to edit event ${req.params.event}. Changes: ${JSON.stringify(req.body)}`);
        const { title, description, date, location } = req.body;

        // Checking if club exists first as we need a valid club to get possible role
        const event = await Event.findOne({ _id: req.params.event });
        if (!event) {
            throw new HttpError(404,'Not Found: Fail to edit event as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to edit a club');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new HttpError(403,'Unauthorized: Only admins can modify the club.');
        }

        const updateStatus = await Event.updateOne({ _id: req.params.event }, req.body);
        if (!updateStatus.acknowledged) {
            throw new HttpError(400,'Bad Request: Failed to edit event.');
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
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Event Deletion
Expected Input Type: (URL parameters)
Expected Input: Event ID
Expected Output Structure: JSON object with message confirming event deletion
Expected Errors: Not Found, Unauthorized, Server Error
Purpose: This function allows an admin user to delete an existing event. It verifies the user's admin status for the club and deletes the event if authorized.
----
*/
exports.deleteEvent = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to delete event ${req.params.event}`);

        // Find the event by its ID
        const event = await Event.findOne({ _id: req.params.event });
        if (!event) {
            throw new HttpError(404,'Not Found: Event does not exist');
        }

        // Check if the user is authorized to delete the event
        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to delete an event');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new HttpError(403,'Unauthorized: Only admins can delete events');
        }

        // Delete the event
        await Event.deleteOne({ _id: req.params.event });

        res.status(200).json({
            status: "success",
            message: "Event deleted successfully",
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};
/*
----
Core Feature(s): Event Browsing
Expected Input Type: (body)
Expected Input: Object with properties like limit (optional) and includeJoined (optional)
Expected Output Structure: JSON object with events for browsing
Expected Errors: Server Error
Purpose: This function retrieves events for browsing, possibly with a limit and considering the user's joined clubs if available.
----
*/
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
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Event Retrieval
Expected Input Type: (None)
Expected Input: None
Expected Output Structure: JSON object with all upcoming events
Expected Errors: Server Error
Purpose: This function retrieves all upcoming events, regardless of club or user, sorted by date.
----
*/
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
        handleError.returnError(err, req.sessionID, res);
    }
  };

  /*
----
Core Feature(s): Event Retrieval
Expected Input Type: (URL parameters)
Expected Input: User ID
Expected Output Structure: JSON object with events associated with the user's clubs
Expected Errors: Server Error
Purpose: This function retrieves events associated with clubs that the specified user is a member of.
----
*/
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
        handleError.returnError(err, req.sessionID, res);
    }
};