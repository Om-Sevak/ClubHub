// authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/', authController.login);

router.post('/logout', authController.logout);

router.put('/', authController.register);

router.get('/loginStatus', authController.isLoggedIn);

module.exports = router;
