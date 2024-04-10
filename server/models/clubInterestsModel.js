/*********************************************************************************
    FileName: clubInterestsModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for club interests. It includes fields for club and interest references, both of which are ObjectId references to other collections in the database (Club and Interest). The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/


const mongoose = require('mongoose');

const clubInterestSchema = new mongoose.Schema({
    club: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the club
        ref: 'Club',
        required: true
    },
    interest: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the interest
        ref: 'Interest',
        required: true
    }
});

const ClubInterest = mongoose.model('ClubInterest', clubInterestSchema);

module.exports = ClubInterest;
