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
