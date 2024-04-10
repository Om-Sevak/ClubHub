/*********************************************************************************
    FileName: interestModel.js
    FileVersion: 1.0
    Core Feature(s): Database Model Definition
    Purpose: This file defines the Mongoose schema and model for interests. It includes a field for the interest name, which is required and unique. The model is exported for use in other parts of the application, enabling interaction with the MongoDB database.
*********************************************************************************/

const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

const Interest = mongoose.model('Interest', interestSchema);

module.exports = Interest;