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
