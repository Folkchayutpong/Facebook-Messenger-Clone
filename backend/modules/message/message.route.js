const express = require("express");
const router = express.Router();
const messageController = require("./message.controller");
const { expressAuthMiddleware } = require("../../middleware/auth"); 

// สร้างข้อความใหม่
router.post("/", expressAuthMiddleware, messageController.createMessage);

// ดึงข้อความทั้งหมดใน chat
router.get("/:chatId", expressAuthMiddleware, messageController.getMessages);

// แก้ไขข้อความ
router.patch("/:messageId", expressAuthMiddleware, messageController.editMessage);

// ลบข้อความ
router.delete("/:messageId", expressAuthMiddleware, messageController.deleteMessage);

module.exports = router;
