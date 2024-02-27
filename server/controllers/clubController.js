const Club = require("../models/clubModel");
const User = require("../models/userModel")
const clubRole = require("./clubroleController");

exports.createClub = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create club. Changes: ${JSON.stringify(req.body)}`);
        const { name, description, email } = req.body;
        //const executives = [];

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

        const userEmail = req.session.email
        const user = await User.findOne({ email: userEmail });
        const userObjectId = user._id;

        const newClub = await Club.create({
            name: name,
            description: description,
            email: email,
            createdBy: userObjectId
        });

        const adminRole = await clubRole.createAdminRoleMiddleware(userEmail, name);

        res.status(200).json({ message: 'Club created successfully' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
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
            throw new Error('Not Found: Fail to edit club as DNE');
        }

        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete a club');
        }

        const isAdmin = await clubRole.isClubAdminMiddleware(req.session.email, req.params.name);
        if (!isAdmin) {
            throw new Error('Unauthorized: Only admins can delete the club.');
        }

        const deleteStatus = await Club.deleteMany({ name: req.params.name });
        if (!updateStatus.acknowledged) {
            throw err;
        }

        res.status(200).json({
            status: "success",
            message: "club deleted",
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
        } else if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Fail to delete new club as ${req.params.name} DNE`,
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