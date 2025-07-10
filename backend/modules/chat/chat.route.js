const express = require("express");
const router = express.Router();
const chatController = require("./chat.controller");
const { expressAuthMiddleware } = require("../../middleware/auth");

router.post("chats", expressAuthMiddleware, chatController.CreateGroupChat);
router.get("chats", expressAuthMiddleware, chatController.GetChats);
router.patch("chats/:id", expressAuthMiddleware, chatController.UpdateChat);
router.delete("chats/:id", expressAuthMiddleware, chatController.DeleteChat);

module.exports = router;
