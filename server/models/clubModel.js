const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user who created the club
        ref: 'User'
    },
    executives: [{
        type: mongoose.Schema.Types.ObjectId, // Reference to users who are executives
        ref: 'User'
    }],
    imgUrl: {
        type: String
    }
});

const Club = mongoose.model('Club', clubSchema);

module.exports = Club;
