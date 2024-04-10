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