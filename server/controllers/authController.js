// authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const interestsController = require('./interestController');

exports.login = async (req, res) => {
    try {
        console.log(`${req.sessionID} - Is attempting login with credentials: ${JSON.stringify(req.body)}`);
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Unauthorized: Invalid email or password' );
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            throw new Error('Unauthorized: Invalid email or password' );
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
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.register = async (req, res) => {
    try {
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

        //validate password, min length 8
        if (password.length < 8) {
            throw new Error('Bad Request: Password must be at least 8 characters long');
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

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

        if (interest){
            const newInterests = await interestsController.createUserInterestsMiddleware(interest, newUser.email);
        }
           
        res.status(200).json({ message: 'User created successfully' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);
        
    } catch (err) {
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
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};

exports.isLoggedIn = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request To Check if logged in`);
        
        const loggedInStatus = req.session.isLoggedIn ? true : false;

        let userName = "";

        if(loggedInStatus){
            // Get user's name
            const user = await User.findOne({ email: req.session.email });
            if(user){
                userName = user.firstName;
                //make sure its camel case
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
            }
        }

        res.status(200).json({
            loggedInStatus: loggedInStatus,
            userName: userName,
            message: "Login Status Found"
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

exports.logout = async(req, res) => {
    try {
        console.log(`${req.sessionID} - Request To Check if Logged in on`);
    
        if (!req.session.isLoggedIn) {
            throw new Error('Bad Request: Must be logged in to log out (fool!)');
        }

        req.session.isLoggedIn = false;
        req.session.email = null;
        req.session.save();
        console.log(`\n *** ${req.sessionID} - Session unsaved with IP: ${req.ip} *** \n`);

        res.status(200).json({ message: 'Logout successful' });
        console.log(`${req.sessionID} - Request Success: ${req.method}  ${req.originalUrl}`);

    } catch (err) {
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
            console.log(`${req.sessionID} - Server Error: ${err}`)
        }
        console.log(`${req.sessionID} - Request Failed: ${err.message}`);
    }
};