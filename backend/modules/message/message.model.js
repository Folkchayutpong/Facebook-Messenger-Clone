const { Schema, model, Types } = require("mongoose");

const messageSchema = new Schema({
  chatId: { type: Types.ObjectId, ref: "Chat", required: true }, //บอกว่าเป็น chat ไหน
  sender: { type: Types.ObjectId, ref: "User", required: true }, // บอกว่าใครส่ง
  senderName: { type: String, required: true }, // ชื่อผู้ส่ง
  content: { type: String, required: true }, // ข้อความ
  messageType: {
    type: String,
    enum: ["text", "image", "file", "system"],
    default: "text",
  }, // ประเภทที่ส่ง รูป, ข้อความ, ไฟล์
  mediaUrl: { type: String, default: null }, // เก็บ link media
  replyTo: { type: Types.ObjectId, ref: "Message", default: null }, // บอกว่าตอบกลับข้อความไหน
  sentAt: { type: String, required: true }, // บอกเวลาส่ง
  readBy: { type: [{ type: Types.ObjectId, ref: "User" }], default: [] }, // บอกชื่อคนที่อ่าน
  isEdited: { type: Boolean, default: false }, // edit ข้อความ
});

module.exports = model("Message", messageSchema);
