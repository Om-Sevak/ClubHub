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
