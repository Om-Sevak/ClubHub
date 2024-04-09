
/*
----
Core Feature(s): 

1. User Login
2. User Registration
3. Check Login Status
4. User Logout

Expected Input Type: body
Expected Input: JSON object containing relevant data for each feature
Expected Output Structure: JSON object with relevant data for each feature
Expected Errors: Relevant error codes for each feature
Purpose: Authentication, user management, and session control.
----
*/


// Import necessary modules and controllers
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const interestsController = require('./interestController');

// Function to handle user login
exports.login = async (req, res) => {
    try {
        // Log the login attempt
        console.log(`${req.sessionID} - Is attempting login with credentials: ${JSON.stringify(req.body)}`);
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Unauthorized: Invalid email or password');
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Unauthorized: Invalid email or password');
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
        // Handle errors during login
        if (err.message.includes('Unauthorized')) {
            res.status(401).json({
                status: "fail",
                message: err.message,
                description: `Unauthorized: Failed to login`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`);
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

// Function to handle user registration
exports.register = async (req, res) => {
    try {
        // Log the registration attempt
        console.log(`${req.sessionID} - Is attempting create account with credentials: ${JSON.stringify(req.body)}`);
        const { firstName, lastName, email, password, interest } = req.body;
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Bad Request: Invalid email format');
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error('Bad Request: User already exists');
        }

        // Validate password length
        if (password.length < 8) {
            throw new Error('Bad Request: Password must be at least 8 characters long');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // Check if interests are provided and meet requirements
        if (interest && interest.length < 3){
            throw new Error('Bad Request: Please select at least 3 interests');
        }

        // Create a new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            passwordHash
        });

        // If interests provided, create new interests
        if (interest){
            const newInterests = await interestsController.createUserInterestsMiddleware(interest, newUser.email);
        }
           
        res.status(200).json({ message: 'User created successfully' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
        
    } catch (err) {
        // Handle errors during registration
        if (err.message.includes('Bad Request')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Failed to Register`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`);
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

// Function to check if user is logged in
exports.isLoggedIn = async(req, res) => {
    try {
        // Log the request to check login status
        console.log(`${req.sessionID} - Request To Check if logged in`);
        
        // Check if user is logged in
        const loggedInStatus = req.session.isLoggedIn ? true : false;

        let userName = "";

        // If logged in, get user's name
        if(loggedInStatus){
            const user = await User.findOne({ email: req.session.email });
            if(user){
                userName = user.firstName;
                // Make sure it's in camel case
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            }
        }

        // Send login status response
        res.status(200).json({
            loggedInStatus: loggedInStatus,
            userName: userName,
            message: "Login Status Found"
        });
        
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        // Handle errors during login status check
        res.status(500).json({
            status: "fail",
            message: err.message,
            description: `Bad Request: Server Error`,
        });
        console.log(`${req.sessionID} - Server Error: ${err}`);
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

// Function to handle user logout
exports.logout = async(req, res) => {
    try {
        // Log the logout attempt
        console.log(`${req.sessionID} - Request To Check if Logged in on`);
    
        // Check if user is logged in
        if (!req.session.isLoggedIn) {
            throw new Error('Bad Request: Must be logged in to log out (fool!)');
        }

        // Clear session data and logout
        req.session.isLoggedIn = false;
        req.session.email = null;
        req.session.save();
        console.log(`\n *** ${req.sessionID} - Session unsaved with IP: ${req.ip} *** \n`);

        // Send logout response
        res.status(200).json({ message: 'Logout successful' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
        // Handle errors during logout
        if (err.message.includes('Bad Request')) {
            res.status(400).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Failed to logout`,
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: err.message,
                description: `Bad Request: Server Error`,
            });
            console.log(`${req.sessionID} - Server Error: ${err}`);
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};
