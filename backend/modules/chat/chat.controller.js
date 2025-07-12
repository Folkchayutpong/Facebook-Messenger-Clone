const chatService = require("./chat.service");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

async function CreateGroupChat(req, res) {
  const { name, members } = req.body;
  const creatorID = req.user.id;
  const type = "group";

  if (!name || !members || !Array.isArray(members)) {
    return res.status(400).json({ message: "Missing or invalid fields" });
  }

  const memberSet = new Set(members.map(String));
  memberSet.add(creatorID);

  const memberList = Array.from(memberSet);
  if (memberList.length < 2) {
    return res.status(400).json({
      message: "Group chat must have at least 2 unique members",
    });
  }

  if (memberList.length > 10) {
    return res.status(400).json({
      message: "Group chat can have a maximum of 10 members",
    });
  }

  try {
    const memberObjectIds = memberList.map((id) => new ObjectId(id));
    const result = await chatService.createGroupChatService(
      name,
      memberObjectIds,
      type,
      memberObjectIds[memberObjectIds.length - 1]
    );

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function GetChats(req, res) {
  const userId = req.user.id;
  try {
    const result = await chatService.getChatsService(userId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function UpdateChat(req, res) {
  const id = req.params.id;
  const { newName, add_Members, remove_Members, add_Admin, remove_Admin } =
    req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing chat ID" });
  }

  try {
    const isAdmin = await chatService.checkAdmin(id, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    // Rename chat
    if (newName) {
      try {
        await chatService.renameChat(id, newName);
      } catch (err) {
        console.error("Error renaming chat:", err);
        return res
          .status(500)
          .json({ message: "Failed to rename chat", error: err.message });
      }
    }

    // Add members
    if (Array.isArray(add_Members) && add_Members.length > 0) {
      try {
        await chatService.addMembers(id, add_Members);
      } catch (err) {
        console.error("Error adding members:", err);
        return res
          .status(500)
          .json({ message: "Failed to add members", error: err.message });
      }
    }

    // Remove members
    if (Array.isArray(remove_Members) && remove_Members.length > 0) {
      try {
        await chatService.removeMembers(id, remove_Members);
      } catch (err) {
        console.error("Error removing members:", err);
        return res
          .status(500)
          .json({ message: "Failed to remove members", error: err.message });
      }
    }

    // Add admin
    if (Array.isArray(add_Admin) && add_Admin.length > 0) {
      try {
        console.log(add_Admin);
        await chatService.addAdmins(id, add_Admin);
      } catch (err) {
        console.error("Error adding admins:", err);
        return res
          .status(500)
          .json({ message: "Failed to add admins", error: err.message });
      }
    }

    // Remove admin
    if (Array.isArray(remove_Admin) && remove_Admin.length > 0) {
      try {
        await chatService.removeAdmins(id, remove_Admin);
      } catch (err) {
        console.error("Error removing admins:", err);
        return res
          .status(500)
          .json({ message: "Failed to remove admins", error: err.message });
      }
    }

    res.status(200).json({
      message: "Chat updated successfully",
    });
  } catch (err) {
    console.error("UpdateChat Error:", err);
    res.status(500).json({ message: err.message });
  }
}

async function DeleteChat(req, res) {
  const id = req.params.id;
  const userId = req.user.id;
  const isAdmin = await chatService.checkAdmin(id, userId);
  if (!isAdmin) {
    return res.status(403).json({ message: "You are not an admin" });
  }
  try {
    const result = await chatService.deleteChat(id, userId);
    res.status(200).json("Chat deleted successfully", result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { CreateGroupChat, GetChats, UpdateChat, DeleteChat };
