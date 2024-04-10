/*********************************************************************************
    FileName: postRoutes.js
    FileVersion: 1.0
    Core Feature(s): Express Router Configuration
    Purpose: This file defines the routes related to posts using Express Router. It imports the necessary modules and sets up the router to handle different HTTP requests for post-related tasks such as creating, retrieving, editing, and deleting posts. Additionally, it includes a route for browsing posts with an algorithm used for interests. Finally, it exports the configured router for use in other modules.
*********************************************************************************/

const express = require("express");
const postController = require("../controllers/postController");

const router = express.Router();

// Get postss with interests algorthim used
router.route("/browse").post(postController.getPostsBrowse);

// Post endpoints
router.route("/:name").post(postController.createPost);
router.route("/:name").get(postController.getPostsForClub);
router.route("/:name/:post").get(postController.getPost);
router.route("/:name/:post").put(postController.editPost);
router.route("/:name/:post").delete(postController.deletePost);

module.exports = router;