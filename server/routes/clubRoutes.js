const express = require("express");
const clubController = require("../controllers/clubController");

const router = express.Router();

// Boilerplate code, all API endpoints related to clubs will go here
// Can have a different router for users, events, posts etc

// Example: get all clubs
router.get("/", (req,res) => {
    res.send("Club List")
});

// Example: create a new club by calling the controller method
router.route("/").post(clubController.createClub);

// Get clubs with interests algorthim used
router.route("/browse").post(clubController.getClubsBrowse);

router.route("/:name").put(clubController.editClub);
router.route("/:name").delete(clubController.deleteClub);

// Example: get a specific club based on club name
router.route("/:name").get(clubController.getClub);
router.route("/clubs/:query").get(clubController.getClubs);

// Note: always put static routes (ex: /new) before dynamic routes (ex: /:id)


module.exports = router;