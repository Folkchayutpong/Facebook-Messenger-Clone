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
  const { newName, addMembers, removeMembers, addAdmin, removeAdmin } =
    req.body;

  if (!id) {
    return res.status(400).json({ message: "Missing chat ID" });
  }

  try {
    const isAdmin = await chatService.checkAdmin(id, req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: "You are not an admin" });
    }

    const results = [];

    // Rename
    if (newName) {
      const renameResult = await chatService.renameChat(id, newName);
      results.push({ action: "rename", result: renameResult });
    }

    // Add members
    if (Array.isArray(addMembers) && addMembers.length > 0) {
      const addResult = await chatService.addMembers(id, addMembers);
      results.push({ action: "addMembers", result: addResult });
    }

    // Remove members
    if (Array.isArray(removeMembers) && removeMembers.length > 0) {
      const removeResult = await chatService.removeMembers(id, removeMembers);
      results.push({ action: "removeMembers", result: removeResult });
    }

    // Add admin
    if (Array.isArray(addAdmin) && addAdmin.length > 0) {
      const addAdminResult = await chatService.addAdmins(id, addAdmin);
      results.push({ action: "addAdmins", result: addAdminResult });
    }

    // Remove admin
    if (Array.isArray(removeAdmin) && removeAdmin.length > 0) {
      const removeAdminResult = await chatService.removeAdmins(id, removeAdmin);
      results.push({ action: "removeAdmins", result: removeAdminResult });
    }

    if (results.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid update actions provided" });
    }

    res.status(200).json({
      success: true,
      message: "Chat updated successfully",
      changes: results,
    });
  } catch (err) {
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
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { CreateGroupChat, GetChats, UpdateChat, DeleteChat };
