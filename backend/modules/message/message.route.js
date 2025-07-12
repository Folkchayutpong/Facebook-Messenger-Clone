const express = require("express");
const router = express.Router();
const messageController = require("./message.controller");
const auth = require("../../middleware/auth"); 

// สร้างข้อความใหม่
router.post("/", auth, messageController.createMessage);

// ดึงข้อความทั้งหมดใน chat
router.get("/:chatId", auth, messageController.getMessages);

// แก้ไขข้อความ
router.patch("/:messageId", auth, messageController.editMessage);

// ลบข้อความ
router.delete("/:messageId", auth, messageController.deleteMessage);

module.exports = router;
