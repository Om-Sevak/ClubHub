const express = require("express");
const clubController = require("../controllers/clubController");
const eventController = require("../controllers/eventController");
const postController = require("../controllers/postController");

const router = express.Router();

// Boilerplate code, all API endpoints related to clubs will go here
// Can have a different router for users, events, posts etc

// Example: get all clubs
router.get("/", (req,res) => {
    res.send("Club List")
});

router.route("/events").get(eventController.getAllEvents);
// Example: create a new club by calling the controller method
router.route("/").post(clubController.createClub);

// Get clubs with interests algorthim used
router.route("/clubs/browse").post(clubController.getClubsBrowse);
router.route("/events/browse").post(eventController.getEventsBrowse);
router.route("/posts/browse").post(postController.getPostsBrowse);

router.route("/:name").put(clubController.editClub);

router.route("/:name").delete(clubController.deleteClub);

// Example: get a specific club based on club name
router.route("/:name").get(clubController.getClub);
router.route("/clubs/:query").get(clubController.getClubs);

// Create a new club event

router.route("/:name/event").post(eventController.createEvent);
router.route("/:name/event").get(eventController.getEventsForClub);
router.route("/event/user/:user").get(eventController.getEventsForUser);
router.route("/:name/event/:event").get(eventController.getEvent);
router.route("/:name/event/:event").put(eventController.editEvent);
router.route("/:name/event/:event").delete(eventController.deleteEvent);

//Posts
router.route("/:name/post").post(postController.createPost);
router.route("/:name/post").get(postController.getPostsForClub);
router.route("/:name/post/:post").get(postController.getPost);
router.route("/:name/post/:post").put(postController.editPost);
router.route("/:name/post/:post").delete(postController.deletePost);
// Note: always put static routes (ex: /new) before dynamic routes (ex: /:id)


module.exports = router;