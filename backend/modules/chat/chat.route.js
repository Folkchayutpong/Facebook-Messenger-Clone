const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const { expressAuthMiddleware } = require("../../middleware/auth");

router.post("/", expressAuthMiddleware, chatController.CreateGroupChat);
router.get("/", expressAuthMiddleware, chatController.GetChats);
router.patch("/:id", expressAuthMiddleware, chatController.UpdateChat);
router.delete("/:id", expressAuthMiddleware, chatController.DeleteChat);

module.exports = router;
