/*********************************************************************************
	FileName: clubroleController.js
	FileVersion: 1.0
	Core Feature(s): Club Role Management
	Purpose: This file contains controller and middleware functions to manage user roles within clubs. It allows users to fetch their roles in clubs, create new roles, and delete existing roles. These functions interact with the database to retrieve user and club information and handle role-related operations accordingly.
*********************************************************************************/


const Club = require('../models/clubModel');
const User = require('../models/userModel');
const ClubMemberships = require('../models/clubMembershipsModel');
const HttpError = require('../error/HttpError');
const handleError = require('../error/handleErrors');

/*
----

Core Feature(s): Get Role Middleware
Expected Input Type: (email, clubName)
Expected Input: Email of the user requesting the role, name of the club
Expected Output Structure: Role of the user in the club or null if user or club does not exist
Expected Errors: Server Error
Purpose: Middleware function to fetch the role of a user in a club. It retrieves user and club details from the database and returns the user's role in the specified club.
----
*/

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

        const role = await ClubMemberships.findOne({user:user.id, club:club.id })

        return !role ? role : role.role;

    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

/*
----

Core Feature(s): Create Admin Role Middleware
Expected Input Type: (email, clubName)
Expected Input: Email of the user requesting the role, name of the club
Expected Output Structure: None
Expected Errors: Server Error
Purpose: Middleware function to create an admin role for a user in a club. It checks if the user and club exist, then creates an admin role for the user in the specified club.
----
*/

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

        const role = await ClubMemberships.create({user:user._id, club:club._id, role: "admin" })
    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

/*
----

Core Feature(s): Is Club Admin Middleware
Expected Input Type: (email, clubName)
Expected Input: Email of the user requesting the role, name of the club
Expected Output Structure: Boolean indicating whether the user is an admin in the club
Expected Errors: Server Error
Purpose: Middleware function to check if a user is an admin in a club. It utilizes the getRoleMiddleware function and returns true if the user's role in the club is 'admin'.
----
*/

exports.isClubAdminMiddleware = async (email,clubName) => {
    try {
        return (await this.getRoleMiddleware(email,clubName) == 'admin');

    } catch (err) {
        console.log(`Server Error: ${err}`)
        return;
    }
}

/*
----

Core Feature(s): Get Role
Expected Input Type: (req, res)
Expected Input: HTTP request containing session email and club name as URL parameters
Expected Output Structure: JSON object with user's role in the club, or error details
Expected Errors: Unauthorized, Not Found
Purpose: Controller function to handle HTTP requests for fetching a user's role in a club. It calls the getRoleMiddleware function, retrieves the user's role, and sends the response accordingly.
----
*/

exports.getRole = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting role for club ${ req.params.name}`);
        const role = await this.getRoleMiddleware(req.session.email, req.params.name); 
        
        if (!role) {
            throw new HttpError(404,`Not Found: Could not find role`);
        }

        res.status(200).json({
            status: "success",
            message: `${req.session.email} is part of ${req.params.name}`,
            data: {
                role: role
            },
        });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res, {role: null})
    }
}

/*
----

Core Feature(s): Create Role
Expected Input Type: (req, res)
Expected Input: HTTP request containing session email, club name as URL parameter, and role details in the request body
Expected Output Structure: Success message indicating the user has joined the club, or error details
Expected Errors: Unauthorized, Bad Request
Purpose: Controller function to handle HTTP requests for creating a new role in a club. It verifies user authentication, checks for existing memberships, and creates a new role for the user in the specified club.
----
*/

exports.createRole = async (req,res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to create role for club ${ req.params.name}`);
        const { role } = req.body;
        
        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to join a club');
        }

        const userEmail = req.session.email;
        const clubName = req.params.name;
        const member = await this.getRoleMiddleware(userEmail, clubName)

        // Validating that this user is not already a member of this club
        if (member) {
            throw new HttpError(400,`Bad Request: You are already a member of club ${clubName}.`);
        }

        const club = await Club.findOne({ name: clubName })
        const user = await User.findOne({ email: userEmail });

        // Validating that if the request is for an Admin role, an admin doesnt already exist for this club
        if (role === "admin") {
            const clubAdmin = await ClubMemberships.findOne({ club: club.id, role: "admin"})
            if (clubAdmin) {
                throw new HttpError(400,`Bad Request: An admin already exists for club ${clubName}. A club can have at most 1 Admin`);
            }
        }

        const newRole = await ClubMemberships.create({
            user: user._id,
            club: club._id,
            role: role
        });

        res.status(200).json({ message: `Joined club ${clubName} successfully` });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
    }
    catch (err) {
        handleError.returnError(err, req.sessionID, res)
    }
}

/*
----

Core Feature(s): Delete Role
Expected Input Type: (req, res)
Expected Input: HTTP request containing session email and club name as URL parameters
Expected Output Structure: Success message indicating the user has left the club, or error details
Expected Errors: Unauthorized, Bad Request
Purpose: Controller function to handle HTTP requests for deleting a role in a club. It verifies user authentication, checks for existing memberships, and deletes the user's role in the specified club.
----
*/


exports.deleteRole = async(req, res) => {
    try {
        console.log(`${req.sessionID} - ${req.session.email} is requesting to leave club ${ req.params.name}`);

        if (!req.session.isLoggedIn) {
            throw new HttpError(403,'Unauthorized: Must sign in to delete a club');
        }

        const userEmail = req.session.email;
        const clubName = req.params.name;
        const club = await Club.findOne({ name: clubName});
        const user = await User.findOne({ email: userEmail }); 

        const member = await this.getRoleMiddleware(userEmail, clubName);
        // Validating that this user is a member of this club
        if (!member) {
            throw new HttpError(400,`Bad Request: You are are not a member of club ${clubName}.`);
        }

        // Validating that this user is not an Admin
        const isAdmin = await this.isClubAdminMiddleware(userEmail, clubName);
        if (isAdmin) {
            throw new HttpError(400,'Bad Request: Admin can not leave the club.');
        }

        // Delete the ClubMembership record for this user
        const deleteStatus = await ClubMemberships.deleteOne({ club: club.id, user: user.id });
        if (!deleteStatus.acknowledged) {
            throw err;
        }

        res.status(200).json({message: "Left Club Succesfully"});
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
}
