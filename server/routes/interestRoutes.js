const express = require('express');
const router = express.Router();
const interestController = require('../controllers/interestController');

router.route("/").get(interestController.getAllInterests)

module.exports = router;