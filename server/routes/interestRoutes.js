const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');

router.route("/").get(interestController.getAllInterests);
router.route("/:name").get(interestController.getClubInterests);

module.exports = router;