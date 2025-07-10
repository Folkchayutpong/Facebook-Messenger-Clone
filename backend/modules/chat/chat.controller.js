const chatService = require("./chat.service");

async function CreateGroupChat(req, res) {
  const { name, members } = req.body;
  if (!name || !members) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const creatorID = req.user.id;
  const type = "group";
  members.push(creatorID);

  if (members.length < 2) {
    return res
      .status(400)
      .json({ message: "Group chat must have at least 2 members" });
  }

  if (members.length > 10) {
    return res
      .status(400)
      .json({ message: "Group chat can have a maximum of 10 members" });
  }

  try {
    const result = await chatService.createGroupChatService(
      name,
      members,
      type
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { CreateGroupChat };
