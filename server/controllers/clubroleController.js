/*
----
Core Feature(s): Club Role Management
Expected Input Type: (req: Request, res: Response)
Expected Input:
    - req: Request object
    - res: Response object
Expected Output Structure: 
    - JSON object
        {
            status: string ("success" or "fail"),
            message: string (success message or error message),
            data: {
                role: string (role of the user in the club)
            }
        }
Expected Errors:
    - Not Found: Could not find role for user and club
    - Bad Request: Server Error
Purpose: Manages user roles within clubs, including retrieval, creation, and deletion of roles.
----
*/

// Import necessary modules and models
const Club = require('../models/clubModel');
const User = require('../models/userModel');
const ClubMemberships = require('../models/clubMembershipsModel');

// Middleware function to retrieve user role in a club
exports.getRoleMiddleware = async (email, clubName) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });
        // Find the club by name
        const club = await Club.findOne({ name: clubName })

        // Check if user and club exist
        if (!user || !club) {
            return;
        }

        // Find user's role in the club
        const role = await ClubMemberships.findOne({ user: user.id, club: club.id })

        return !role ? role : role.role; // Return user's role if found
    } catch (err) {
        console.log(`Server Error: ${err}`); // Log error if any
        return;
    }
}

// Middleware function to create admin role for a user in a club
exports.createAdminRoleMiddleware = async (email, clubName) => {
    try {
        // Find the user by email
        const user = await User.findOne({ email: email });
        // Find the club by name
        const club = await Club.findOne({ name: clubName })

        // Check if user and club exist
        if (!user || !club) {
            return;
        }

        // Create admin role for the user in the club
        const role = await ClubMemberships.create({ user: user._id, club: club._id, role: "admin" })
    } catch (err) {
        console.log(`Server Error: ${err}`); // Log error if any
        return;
    }
}

// Middleware function to check if user is an admin of a club
exports.isClubAdminMiddleware = async (email, clubName) => {
    try {
        // Check if user is an admin of the club
        return (await this.getRoleMiddleware(email, clubName) == 'admin');
    } catch (err) {
        console.log(`Server Error: ${err}`); // Log error if any
        return;
    }
}

// Controller function to get user's role in a club
exports.getRole = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting role for club ${req.params.name}`);
        // Retrieve user's role for the club
        const role = await this.getRoleMiddleware(req.session.email, req.params.name);

        if (!role) {
            throw new Error(`Not Found: Could not find role`); // Throw error if role not found
        }

        // Send response with user's role
        res.status(200).json({
            status: "success",
            message: `${req.session.email} is part of ${req.params.name}`,
            data: {
                role: role
            },
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    } catch (err) {
        if (err.message.includes('Not Found')) {
            // Handle "Not Found" error
            res.status(404).json({
                status: "fail",
                message: err.message,
                description: `Not Found: Could not find role for user ${req.session.email} and club ${req.params.name}`,
                data: {
                    role: null
                }
            });
        } else {
            // Handle other errors
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

// Controller function to create a user's role in a club
exports.createRole = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create role for club ${req.params.name}`);
        const { role } = req.body;

        // Check if user is logged in
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to join a club');
        }

        const userEmail = req.session.email;
        const clubName = req.params.name;
        const member = await this.getRoleMiddleware(userEmail, clubName)

        // Validate that the user is not already a member of the club
        if (member) {
            throw new Error(`Bad Request: You are already a member of club ${clubName}.`);
        }

        const club = await Club.findOne({ name: clubName })
        const user = await User.findOne({ email: userEmail });

        // Validate that if the request is for an Admin role, an admin doesn't already exist for this club
        if (role === "admin") {
            const clubAdmin = await ClubMemberships.findOne({ club: club.id, role: "admin" })
            if (clubAdmin) {
                throw new Error(`Bad Request: An admin already exists for club ${clubName}. A club can have at most 1 Admin`);
            }
        }

        // Create a new role for the user in the club
        const newRole = await ClubMemberships.create({
            user: user._id,
            club: club._id,
            role: role
        });

        res.status(200).json({ message: `Joined club ${clubName} successfully` }); // Send success message
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

// Controller function to delete a user's role in a club
exports.deleteRole = async (req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to leave club ${req.params.name}`);

        // Check if user is logged in
        if (!req.session.isLoggedIn) {
            throw new Error('Unauthorized: Must sign in to delete a club');
        }

        const userEmail = req.session.email;
        const clubName = req.params.name;
        const club = await Club.findOne({ name: clubName });
        const user = await User.findOne({ email: userEmail });

        const member = await this.getRoleMiddleware(userEmail, clubName);
        // Validate that the user is a member of the club
        if (!member) {
            throw new Error(`Bad Request: You are are not a member of club ${clubName}.`);
        }

        // Validate that the user is not an admin
        const isAdmin = await this.isClubAdminMiddleware(userEmail, clubName);
        if (isAdmin) {
            throw new Error('Bad Request: Admin can not leave the club.');
        }

        // Delete the ClubMembership record for this user
        const deleteStatus = await ClubMemberships.deleteOne({ club: club.id, user: user.id });
        if (!deleteStatus.acknowledged) {
            throw err;
        }

        res.status(200).json({ message: "Left Club Successfully" }); // Send success message
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
