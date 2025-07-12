const { Types, mongoose } = require("mongoose");

const chatsSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    minLength: 2,
    maxLength: 100,
  },
  members: {
    type: [Types.ObjectId],
    ref: "User",
    required: [true, "Please add members"],
  },
  type: {
    type: String,
    required: true,
    enum: ["private", "group"],
  },
  admins: {
    type: [Types.ObjectId],
    ref: "User",
    required: true,
  },
});

const Chats = mongoose.model("Chats", chatsSchema);

module.exports = Chats;
