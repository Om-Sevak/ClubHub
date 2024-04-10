/*********************************************************************************
    FileName: clubMembershipsModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for club memberships. It includes fields for user, club, and role. The user and club fields are ObjectId references to the User and Club collections, respectively. The role field specifies whether the user has a 'member' or 'admin' role in the club. The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/

const mongoose = require('mongoose');

const clubMembershipSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the user
        ref: 'User',
        required: true
    },
    club: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the club
        ref: 'Club',
        required: true
    },
    role: {
        type: String,
        enum: ['member', 'admin'],
        default: 'member'
    }
});

const ClubMembership = mongoose.model('ClubMembership', clubMembershipSchema);

module.exports = ClubMembership;
