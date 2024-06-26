/*********************************************************************************
	FileName: authController.js
	FileVersion: 1.0
	Core Feature(s): User Authentication, Registration, Session Management, Password Change
	Purpose: This file contains functions related to user authentication, registration, session management, and password change in a web application. It handles user login, registration, logout, checking login status, and changing passwords securely using bcrypt for password hashing. Each function handles specific user-related tasks and interacts with the database to perform necessary operations.
*********************************************************************************/

const User = require('../models/userModel');
const HttpError = require('../error/HttpError');
const handleError = require('../error/handleErrors');
const bcrypt = require('bcryptjs');
const interestsController = require('./interestController');

/*
----
Core Feature(s): User Authentication - Login
Expected Input Type: (body)
Expected Input: Email and password
Expected Output Structure: JSON object with message
Expected Errors: Unauthorized if invalid credentials, Server Error if database operation fails
Purpose: To authenticate user login
----
*/
exports.login = async (req, res) => {
    try {
        console.log(`${req.sessionID} - Is attempting login with credentials: ${JSON.stringify(req.body)}`);
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new HttpError(401,'Unauthorized: Invalid email or password' );
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new HttpError(401,'Unauthorized: Invalid email or password' );
        }
        
        // If successful login, add userid to session
        req.session.isLoggedIn = true;
        req.session.email = email;
        req.session.save();
        console.log(`\n *** ${req.sessionID} - Session saved with username: ${email} and IP: ${req.ip} *** \n`);

        // If password is valid, login successful
        res.status(200).json({ message: 'Login successful' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): User Registration
Expected Input Type: (body)
Expected Input: User details including first name, last name, email, password, and interests (optional)
Expected Output Structure: JSON object with message
Expected Errors: Bad Request if input data is invalid, Server Error if database operation fails
Purpose: To register a new user
----
*/

exports.register = async (req, res) => {
    try {
        console.log(`${req.sessionID} - Is attempting create account with credentials: ${JSON.stringify(req.body)}`);
        const { firstName, lastName, email, password, interest } = req.body;
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new HttpError(400,'Bad Request: Invalid email format');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new HttpError(400,'Bad Request: User already exists');
        }

        //validate password, min length 8
        if (password.length < 8) {
            throw new HttpError(400,'Bad Request: Password must be at least 8 characters long');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        if (interest && interest.length < 3){
            throw new HttpError(400,'Bad Request: Please select at least 3 interests');
        }

        // Create a new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            passwordHash
        });

        if (interest){
            const newInterests = await interestsController.createUserInterestsMiddleware(interest, newUser.email);
        }
           
        res.status(200).json({ message: 'User created successfully' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
        
    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Check Login Status
Expected Input Type: (none)
Expected Input: None
Expected Output Structure: JSON object with login status, user's first name, last name, and email
Expected Errors: Server Error if database operation fails
Purpose: To check if user is logged in and retrieve user details if logged in
----
*/

exports.isLoggedIn = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request To Check if logged in`);
        
        const loggedInStatus = req.session.isLoggedIn ? true : false;

        let firstName = "";
        let lastName = "";

        if(loggedInStatus){
            // Get user's name
            const user = await User.findOne({ email: req.session.email });
            if(user){
                firstName = user.firstName;
                lastName = user.lastName;
                //make sure its camel case
                firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
                lastName = lastName.charAt(0).toUpperCase() + lastName.slice(1);
            }
        }

        res.status(200).json({
            loggedInStatus: loggedInStatus,
            firstName: firstName,
            lastName: lastName,
            email: req.session.email,
            message: "Login Status Found"
        });
        
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): User Logout
Expected Input Type: (none)
Expected Input: None
Expected Output Structure: JSON object with message
Expected Errors: Bad Request if not logged in, Server Error if database operation fails
Purpose: To log out user
----
*/

exports.logout = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request To Check if Logged in on`);
    
        if (!req.session.isLoggedIn) {
            throw new  HttpError(400,'Bad Request: Must be logged in to log out (fool!)');
        }

        req.session.isLoggedIn = false;
        req.session.email = null;
        req.session.save();
        console.log(`\n *** ${req.sessionID} - Session unsaved with IP: ${req.ip} *** \n`);

        res.status(200).json({ message: 'Logout successful' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};

/*
----
Core Feature(s): Change User Password
Expected Input Type: (body)
Expected Input: Current password and new password
Expected Output Structure: JSON object with message
Expected Errors: Bad Request if not logged in, Unauthorized if current password is incorrect, Server Error if database operation fails
Purpose: To allow user to change their password
----
*/
exports.changePassword = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request To Change Password`);
        const { currentPassword, newPassword } = req.body;

        if (!req.session.isLoggedIn) {
            throw new HttpError(400,'Bad Request: Must be logged in to change password');
        }

        // Find the user by email
        const user = await User.findOne({ email: req.session.email });
        if (!user) {
            throw new HttpError(404,'Not Found: User not found');
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new HttpError(400,'Bad Request: Invalid current password');
        }

        //validate password, min length 8
        if (newPassword.length < 8) {
            throw new HttpError(400,'Bad Request: Password must be at least 8 characters long');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(newPassword, 12);

        // Update the user's password
        user.passwordHash = passwordHash;
        await user.save();

        res.status(200).json({ message: 'Password changed successfully' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        handleError.returnError(err, req.sessionID, res);
    }
};