/*********************************************************************************
    FileName: userInterestsModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for user interests. It includes fields for the user ID and interest ID, both of which are references to other collections (User and Interest). Both fields are required. The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/

const mongoose = require('mongoose');

const userInterestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user
        ref: 'User',
        required: true
    },
    interest: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the interest
        ref: 'Interest',
        required: true
    }
});

const UserInterest = mongoose.model('UserInterest', userInterestSchema);

module.exports = UserInterest;
