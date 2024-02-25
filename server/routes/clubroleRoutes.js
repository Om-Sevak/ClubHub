// clubroleRoutes.js
const express = require('express');
const router = express.Router();
const clubroleController = require('../controllers/clubroleController');

router.route("/:name").get(clubroleController.getRole);

router.route("/:name").post(clubroleController.createRole);

router.route("/:name").delete(clubroleController.deleteRole);

module.exports = router;