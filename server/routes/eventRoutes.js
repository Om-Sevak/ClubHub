/*********************************************************************************
    FileName: eventRoutes.js
    FileVersion: 1.0
    Core Feature(s): Express Router Configuration
    Purpose: This file defines the routes related to events using Express Router. It imports the necessary modules and sets up the router to handle different HTTP requests for event-related tasks such as getting all events, creating a new event, editing an event, deleting an event, and getting events for a specific club or user. Additionally, it includes a route for getting events using an algorithm for browsing. Finally, it exports the configured router for use in other modules.
*********************************************************************************/

const express = require("express");
const eventController = require("../controllers/eventController");

const router = express.Router();

router.route("/").get(eventController.getAllEvents);

// Get events with interests algorthim used
router.route("/browse").post(eventController.getEventsBrowse);

// Event Endpoints
router.route("/:name").post(eventController.createEvent);
router.route("/:name").get(eventController.getEventsForClub);
router.route("/user/:user").get(eventController.getEventsForUser);
router.route("/:name/:event").get(eventController.getEvent);
router.route("/:name/:event").put(eventController.editEvent);
router.route("/:name/:event").delete(eventController.deleteEvent);

module.exports = router;
