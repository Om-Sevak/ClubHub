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
