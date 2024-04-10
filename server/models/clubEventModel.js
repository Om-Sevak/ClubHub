/*********************************************************************************
    FileName: clubEventModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for club events. It includes fields such as title, description, date, location, and club reference. The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/

const mongoose = require('mongoose');

const clubEventSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        type: String
    },
    club: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Club'
    }
});

const ClubEvent = mongoose.model('ClubEvent', clubEventSchema);

module.exports = ClubEvent;
