/*********************************************************************************
    FileName: clubPostModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for club posts. It includes fields for title, content, date, imgUrl (URL for post image), and club (reference to the club the post belongs to). The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/

const mongoose = require('mongoose');

const clubPostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    imgUrl: {
        type: String
    },
    club: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Club'
    }
});

const ClubPost = mongoose.model('ClubPost', clubPostSchema);

module.exports = ClubPost;
