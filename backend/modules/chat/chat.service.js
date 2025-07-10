const eventBus = require("../../eventBus");
const Chats = require("./chat.model");

//create private chatService
eventBus.on("CreatePrivateChatService", (data) => {
  const existing = Chats.findOne({
    type: "priavte",
    member: [data.senderId, data.receiverId],
  });

  if (!existing) {
    const newChat = new Chats({
      name: `${data.senderId} and ${data.receiverId}`,
      member: [data.senderId, data.receiverId],
      type: "friend",
    });

    newChat
      .save()
      .then(() => console.log("Private chat created successfully"))
      .cacth((err) => console.log("Error creating private chat", err));
  }
});

//create group chatService
async function createGroupChatService(name, members, type) {
  try {
    const newChat = new Chats({ name, members, type });
    await newChat.save();
    return { message: "Group chat created successfully" };
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createGroupChatService,
};
