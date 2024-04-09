/*
----
Core Feature(s):
Expected Input Type: URL (params)
Expected Input:
- Club name (params)
Expected Output Structure:
- status: string
- message: string
- data: 
  - role: string
Expected Errors:
- Unauthorized: Must sign in to join/delete a club
- Not Found: Could not find role for user and club
- Server Error
Purpose:
Retrieve the role of a user in a specific club.
----
*/




// Import necessary models
const Club = require('../models/clubModel');
const User = require('../models/userModel');
const ClubMemberships = require('../models/clubMembershipsModel');

// Middleware to get the role of a user in a club
exports.getRoleMiddleware = async (email,clubName) => {
    try {
        // Find the user by email (in the session)
        const user = await User.findOne({ email: email });

        // Find the club by id (in the request)
        const club = await Club.findOne({ name: clubName })

        // Check if user exists
        if (!user || !club) {
            return;
        }

        // Find the role of the user in the club
        const role = await ClubMemberships.findOne({user:user.id, club:club.id })

        // Return the role if found
        return !role ? role : role.role;

    } catch (err) {
        // Handle errors
        console.log(`Server Error: ${err}`)
        return;
    }
}

// Middleware to create admin role for a user in a club
exports.createAdminRoleMiddleware = async (email, clubName) => {
    try {
        // Find the user by email (in the session)
        const user = await User.findOne({ email: email });

        // Find the club by id (in the request)
        const club = await Club.findOne({ name: clubName })

        // Check if user exists
        if (!user || !club) {
            return;
        }

        // Create admin role for the user in the club
        const role = await ClubMemberships.create({user:user._id, club:club._id, role: "admin" })
    } catch (err) {
        // Handle errors
        console.log(`Server Error: ${err}`)
        return;
    }
}

// Middleware to check if a user is an admin of a club
exports.isClubAdminMiddleware = async (email,clubName) => {
    try {
        // Check if the user is an admin
        return (await this.getRoleMiddleware(email,clubName) == 'admin');

    } catch (err) {
        // Handle errors
        console.log(`Server Error: ${err}`)
        return;
    }
}

// Controller function to get the role of a user in a club
exports.getRole = async (req,res) => {
    try {
        // Log the request for role information
        console.log(`${req.sessionID} - ${req.session.email} is requesting role for club ${ req.params.name}`);
        const role = await this.getRoleMiddleware(req.session.email, req.params.name); 
        
        // Throw error if role not found
        if (!role) {
            throw new Error(`Not Found: Could not find role`);
        }

        // Respond with role information
        res.status(200).json({
            status: "success",
            message: `${req.session.email} is part of ${req.params.name}`,
            data: {
                role: role
            },
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        // Handle errors
        if (err.message.includes('Not Found')) {
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Could not find role for user ${req.session.email} and club ${req.params.name}`,
                data: {
                    role: null
                }
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

// Controller function to create role for a user in a club
exports.createRole = async (req,res) => {
    try {
        // Log the request to create a role
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create role for club ${ req.params.name}`);
        const { role } = req.body;
        
        // Check if user is logged in
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to join a club');
        }

        // Get user email and club name from request
        const userEmail = req.session.email;
        const clubName = req.params.name;
        const member = await this.getRoleMiddleware(userEmail, clubName)

        // Validate that user is not already a member of the club
        if (member) {
            throw new Error(`Bad Request: You are already a member of club ${clubName}.`);
        }

        // Find club and user
        const club = await Club.findOne({ name: clubName })
        const user = await User.findOne({ email: userEmail });

        // If the role is admin, validate if an admin already exists for the club
        if (role === "admin") {
            const clubAdmin = await ClubMemberships.findOne({ club: club.id, role: "admin"})
            if (clubAdmin) {
                throw new Error(`Bad Request: An admin already exists for club ${clubName}. A club can have at most 1 Admin`);
            }
        }

        // Create role for the user in the club
        const newRole = await ClubMemberships.create({
            user: user._id,
            club: club._id,
            role: role
        });

        // Respond with success message
        res.status(200).json({ message: `Joined club ${clubName} successfully` });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        // Handle errors
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
                description: `Bad Request: Failed to join the club`
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
}

// Controller function to delete role for a user in a club
exports.deleteRole = async(req, res) => {
    try {
        // Log the request to delete a role
        console.log(`${req.sessionID} - ${req.session.email} is requesting to leave club ${ req.params.name}`);

        // Check if user is logged in
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete a club');
        }

        // Get user email and club name from request
        const userEmail = req.session.email;
        const clubName = req.params.name;

        // Find club and user
        const club = await Club.findOne({ name: clubName});
        const user = await User.findOne({ email: userEmail }); 

        // Check if the user is a member of the club
        const member = await this.getRoleMiddleware(userEmail, clubName);
        if (!member) {
            throw new Error(`Bad Request: You are are not a member of club ${clubName}.`);
        }

        // Check if the user is not an admin
        const isAdmin = await this.isClubAdminMiddleware(userEmail, clubName);
        if (isAdmin) {
            throw new Error('Bad Request: Admin can not leave the club.');
        }

        // Delete the ClubMembership record for this user
        const deleteStatus = await ClubMemberships.deleteOne({ club: club.id, user: user.id });
        if (!deleteStatus.acknowledged) {
            throw err;
        }

        // Respond with success message
        res.status(200).json({message: "Left Club Succesfully"});
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        // Handle errors
        if (err.message.includes('Unauthorized')) {
            res.status(403).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: Must sign in to leave club`,
            });
        } else if (err.message.includes('Bad Request')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Failed to leave the club`
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
