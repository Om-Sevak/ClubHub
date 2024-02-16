// authController.js
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
    try {
       
        const { email, password } = req.body;

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Compare the provided password with the hashed password stored in the database
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        
        
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // If password is valid, login successful
        res.status(200).json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login failed:', err);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
};

exports.register = async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const interests = ['Coding'];

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: "Invalid email format",
            });;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        //validate password, min length 8
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create a new user
        const newUser = await User.create({
            firstName,
            lastName,
            email,
            passwordHash,
            interests
        });

        res.status(200).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Registration failed:', err);
        res.status(500).json({ message: 'An error occurred while processing your request' });
    }
};
