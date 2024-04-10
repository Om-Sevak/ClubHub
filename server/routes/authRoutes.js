/*********************************************************************************
    FileName: authRoutes.js
    FileVersion: 1.0
    Core Feature(s): Express Router Configuration
    Purpose: This file defines the routes related to authentication using Express Router. It imports the necessary modules and sets up the router to handle different HTTP requests for authentication-related tasks such as login, logout, change password, register, and check login status. Finally, it exports the configured router for use in other modules.
*********************************************************************************/

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', authController.login);

router.post('/logout', authController.logout);

router.post('/changePassword', authController.changePassword);

router.put('/', authController.register);

router.get('/loginStatus', authController.isLoggedIn);

module.exports = router;
