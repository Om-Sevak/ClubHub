/*********************************************************************************
    FileName: interestRoutes.js
    FileVersion: 1.0
    Core Feature(s): Express Router Configuration
    Purpose: This file defines the routes related to interests using Express Router. It imports the necessary modules and sets up the router to handle different HTTP requests for interest-related tasks such as getting all interests, getting interests for a specific club or user, and saving user interests. Finally, it exports the configured router for use in other modules.
*********************************************************************************/

const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');

router.route("/").get(interestController.getAllInterests);
router.route("/:name").get(interestController.getClubInterests);
router.route("/user/:name").get(interestController.getUserInterests);
router.route("/save").post(interestController.editUserInterests);

module.exports = router;