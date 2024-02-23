// clubroleRoutes.js
const express = require('express');
const router = express.Router();
const clubroleController = require('../controllers/clubroleController');

router.route("/:name").get(clubroleController.getRole);

module.exports = router;