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

    res
      .status(200)
      .json({ message: "Group chat created successfully" });
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

    if (newName) await chatService.renameChat(id, newName);
    if (Array.isArray(add_Members) && add_Members.length > 0)
      await chatService.addMembers(id, add_Members);
    if (Array.isArray(remove_Members) && remove_Members.length > 0)
      await chatService.removeMembers(id, remove_Members);
    if (Array.isArray(add_Admin) && add_Admin.length > 0)
      await chatService.addAdmins(id, add_Admin);
    if (Array.isArray(remove_Admin) && remove_Admin.length > 0)
      await chatService.removeAdmins(id, remove_Admin);

    res.status(200).json({ message: "Chat updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to update chat" });
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
