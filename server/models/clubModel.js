/*********************************************************************************
    FileName: clubModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for clubs. It includes fields for name, description, email, createdBy (reference to the user who created the club), executives (an array of references to users who are executives), and imgUrl (URL for club image). The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/

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
