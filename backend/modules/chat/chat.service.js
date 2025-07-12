const eventBus = require("../events/eventBus");
const Chats = require("./chat.model");

//create private chatService
eventBus.on("CreatePrivateChatService", async (data) => {
  try {
    const existing = await Chats.findOne({
      type: "private",
      //TODO: find method to make this more efficient
      member: { $all: [data.senderId, data.receiverId] },
    });

    if (!existing) {
      const newChat = new Chats({
        name: `${data.senderId} and ${data.receiverId}`,
        members: [data.senderId, data.receiverId],
        type: "private",
        admins: [data.senderId, data.receiverId],
      });

      await newChat.save();
      console.log("Private chat created successfully");
    } else {
      console.log("Private chat already exists");
    }
  } catch (err) {
    console.error("Error creating private chat:", err.message);
  }
});

//remove private chatService
eventBus.on("RemovePrivateChatService", async (data) => {
  try {
    await Chats.findOneAndDelete({
      type: "private",
      member: { $all: [data.senderId, data.receiverId] },
    });
    console.log("Private chat removed successfully");
  } catch (err) {
    console.error("Error removing private chat:", err.message);
  }
});

//create group chatService
async function createGroupChatService(name, members, type, admins) {
  try {
    const newChat = new Chats({ name, members, type, admins });
    await newChat.save();
    return { message: "Group chat created successfully" };
  } catch (err) {
    throw new Error(err.message);
  }
}

//get all group chatService
async function getChatsService(userId) {
  try {
    const result = await Chats.find({ members: userId }).exec();
    return result;
  } catch (err) {
    throw new Error(err.message);
  }
}

//get chat name
async function getChatName(id) {
  try {
    const result = await Chats.findOne({ _id: id }).exec();
    return result.name;
  } catch (err) {
    throw new Error(err.message);
  }
}

//rename chat
async function renameChat(id, newName) {
  try {
    await Chats.findOneAndUpdate({ _id: id }, { name: newName });
  } catch (err) {
    throw new Error(err.message);
  }
}

//add user to group
async function addMembers(id, members) {
  try {
    await Chats.findOneAndUpdate(
      { _id: id },
      { $addToSet: { members: { $each: members } } }
    );
  } catch (err) {
    throw new Error(err.message);
  }
}

//remove user from group
async function removeMembers(id, members) {
  try {
    await Chats.findOneAndUpdate(
      { _id: id },
      { $pull: { members: { $in: members } } }
    );
  } catch (err) {
    throw new Error(err.message);
  }
}

//add admin to group
async function addAdmins(id, admins) {
  try {
    await Chats.findOneAndUpdate(
      { _id: id },
      { $addToSet: { admins: { $each: admins } } }
    );
  } catch (err) {
    throw new Error(err.message);
  }
}

//remove admin from group
async function removeAdmins(id, admins) {
  try {
    await Chats.findOneAndUpdate(
      { _id: id },
      { $pull: { admins: { $in: admins } } }
    );
  } catch (err) {
    throw new Error(err.message);
  }
}

//delete chat
async function deleteChat(chatId) {
  try {
    const chat = await Chats.findById(chatId);

    if (!chat) {
      throw new Error("Chat not found");
    }

    if (chat.type === "private") {
      throw new Error("Cannot delete private chat");
    }

    const deleted = await Chats.findOneAndDelete({ _id: chatId });
    return deleted;
  } catch (err) {
    throw new Error(err.message);
  }
}

async function checkAdmin(chatId, userId) {
  try {
    const chat = await Chats.findById(chatId).exec();
    return chat.admins.includes(userId);
  } catch (err) {
    throw new Error(err.message);
  }
}

module.exports = {
  createGroupChatService,
  getChatsService,
  getChatName,
  renameChat,
  addMembers,
  removeMembers,
  deleteChat,
  addAdmins,
  removeAdmins,
  checkAdmin,
};
