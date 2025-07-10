const { default: mongoose } = require("mongoose");
const moongoose = require("mongoose");

const chatsSchema = moongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    minLength: 2,
    maxLength: 20,
  },
  members: {
    type: Array,
    required: [true, "Please add members"],
  },
  type: {
    type: String,
    required: true,
    enum: ["private", "group"],
  },
});

const Chats = mongoose.model("Chats", chatsSchema);

module.exports = Chats;
