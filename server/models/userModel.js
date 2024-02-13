const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    interests: [String] // Array of user interests
});

const User = mongoose.model('User', userSchema);

module.exports = User;
