const messageService = require("./message.service");

// POST /messages - ส่งข้อความใหม่
async function createMessage(req, res) {
  try {
    const { chatId, content, messageType, mediaUrl, replyTo, } = req.body;
    // ไม่มี chatId
    if (!chatId) {
      return res
        .status(400)
        .json({ success: false, error: "chatId is required" });
    }
    // ถ้ามีข้อความ
    const hasText = typeof content === "string" && content.trim() !== "";
    // ถ้ามีรูป
    const hasMedia = req.body.mediaUrl !== null && req.body.mediaUrl !== undefined;
    //ต้องมีอย่างใดอย่างนึง
    if (!hasText && !hasMedia) {
      return res.status(400).json({
        success: false,
        error: "Message must contain either text or media",
      });
    }
    // เรียก service สร้างข้อความ
    const message = await messageService.createMessage({
      chatId,
      sender,
      content,
      //เอาแค่ข้อความก่อน
      messageType: "text",
      mediaUrl: null,
      replyTo: replyTo || null, // field ทีเหลือมีค่า default, sentAt เข้าใจว่าไม่ต้องใส่ ถ้าเอาไปเชื่อม mongoose
    });

    return res.status(201).json({ success: true, message });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

// GET /messages/:chatId - ดึงข้อความใน chat
async function getMessages(req, res) {
  try {
    const chatId = req.params.chatId;
    // ไม่มี chatId
     if (!chatId) {
      return res.status(400).json({ success: false, error: "chatId is required" });
    }
    //เรียก service ดึงข้อความ
    const messages = await messageService.getMessages(chatId);
    return res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

// PATCH /messages/:messageId - แก้ข้อความใน chat
async function editMessage(req, res) {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    // ไม่มี messageId
    if (!messageId) {
      return res.status(400).json({ success: false, error: "messageId is required" });
    }
    // ไม่มีใช่ข้อความ
    if (typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ success: false, error: "content must be a non-empty string" });
    }
    //เรียก service แก้ข้อความ
    const updated = await messageService.editMessage({
      messageId,
      content,
      userId,
    });
    return res.json({ success: true, message: updated });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Edit failed" });
  }
}
// DELETE /messages/:messageId - ลบข้อความใน chat
async function deleteMessage(req, res) {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    // ไม่มี messageId
     if (!messageId) {
      return res.status(400).json({ success: false, error: "messageId is required" });
    }
    //เรียก service ลบข้อความ
    await messageService.deleteMessage({ messageId, userId });
    return res.json({ success: true, message: "Message deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Delete failed" });
  }
}

module.exports = {
  createMessage,
  getMessages,
  editMessage,
  deleteMessage,
};
