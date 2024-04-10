/*********************************************************************************
    FileName: clubroleRoutes.js
    FileVersion: 1.0
    Core Feature(s): Express Router Configuration
    Purpose: This file defines the routes related to club roles using Express Router. It imports the necessary modules and sets up the router to handle different HTTP requests for club role-related tasks such as getting roles, creating roles, and deleting roles. Finally, it exports the configured router for use in other modules.
*********************************************************************************/

const express = require('express');
const router = express.Router();
const clubroleController = require('../controllers/clubroleController');

router.route("/:name").get(clubroleController.getRole);

router.route("/:name").post(clubroleController.createRole);

router.route("/:name").delete(clubroleController.deleteRole);

module.exports = router;