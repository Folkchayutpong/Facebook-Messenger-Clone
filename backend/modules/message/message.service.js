const Messages = require("./message.model");

async function createMessage(data) {
  try {
    const newMessage = await Messages.create(data);
    return newMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

async function getMessages(chatId) {
  try {
    const messages = await Messages.find({ chatId });
    return messages;
  } catch (error) {
    console.error("Error getting messages:", error);
    throw error;
  }
}

async function editMessage(data) {
  try {
    const updatedMessage = await Messages.findOneAndUpdate(
      { _id: data.messageId },
      { content: data.content },
      { userId: data.userId },
      { new: true }
    );
    return updatedMessage;
  } catch (error) {
    console.error("Error editing message:", error);
    throw error;
  }
}

async function deleteMessage(data) {
  try {
    await Messages.findOneAndDelete({
      _id: data.messageId,
      userId: data.userId,
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    throw error;
  }
}

module.exports = { createMessage, getMessages, editMessage, deleteMessage };
