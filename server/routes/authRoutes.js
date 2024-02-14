// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', authController.login);

router.put('/', authController.register);

module.exports = router;
