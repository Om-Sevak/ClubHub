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
    interests:{
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Interest'
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
