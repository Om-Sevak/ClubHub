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
