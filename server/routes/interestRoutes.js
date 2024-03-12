const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');

router.route("/").get(interestController.getAllInterests);
router.route("/:name").get(interestController.getClubInterests);
router.route("/user/:name").get(interestController.getUserInterests);
router.route("/save").post(interestController.editUserInterests);

module.exports = router;