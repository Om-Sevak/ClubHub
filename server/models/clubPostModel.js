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
