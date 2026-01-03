const friendService = require("./friend.service");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

async function add(req, res) {
  const io = req.app.get("io");
  const ownerId = req.user.id;
  const { targetId } = req.body;

  if (!targetId) {
    return res.status(400).json({ message: "Missing target user ID" });
  }

  if (ownerId === targetId) {
    return res.status(400).json({ message: "Cannot send request to yourself" });
  }

  try {
    const ownerObjId = new ObjectId(ownerId);
    const targetObjId = new ObjectId(targetId);
    console.log(ownerObjId, targetObjId);
    const ownerUser = await friendService.addService(ownerObjId, targetObjId);
    io.to(`user:${targetId}`).emit("friend:inbound", ownerUser);
    res.status(200).json({ message: "Request sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
  const io = req.app.get("io");
  const ownerId = req.user.id;
  const { targetId } = req.body;

  if (!targetId) {
    return res.status(400).json({ message: "Missing target user ID" });
  }

  if (ownerId === targetId) {
    return res
      .status(400)
      .json({ message: "Cannot remove friend on yourself" });
  }

  try {
    const ownerObjId = new ObjectId(ownerId);
    const targetObjId = new ObjectId(targetId);
    await friendService.removeService(ownerObjId, targetObjId);
    io.to(`user:${ownerId}`).emit("friend:removed", targetId);
    io.to(`user:${targetId}`).emit("friend:removed", ownerId);
    res.status(200).json({ message: "Friend removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function accept(req, res) {
  const io = req.app.get("io");
  const ownerId = req.user.id;
  const { requesterId } = req.body;

  if (!requesterId) {
    return res.status(400).json({ message: "Missing target user ID" });
  }

  if (ownerId === requesterId) {
    return res
      .status(400)
      .json({ message: "Cannot accept request on yourself" });
  }

  try {
    const ownerObjId = new ObjectId(ownerId);
    const requesterObjId = new ObjectId(requesterId);

    const { ownerUser, requesterUser } = await friendService.acceptService(
      ownerObjId,
      requesterObjId
    );

    const existingChat = await Chat.findOne({
      type: "private",
      members: { $all: [ownerObjId, requesterObjId] },
    });

    let chatId;
    if (!existingChat) {
      const newChat = await Chat.create({
        type: "private",
        members: [ownerObjId, requesterObjId],
      });
      chatId = newChat._id;
      console.log("💬 Created new chat:", chatId);
    } else {
      chatId = existingChat._id;
    }

    io.to(`user:${ownerId}`).emit("friend:accepted", requesterUser);
    io.to(`user:${requesterId}`).emit("friend:accepted", ownerUser);

    io.to(`user:${ownerId}`).emit("chat:created", { chatId });
    io.to(`user:${requesterId}`).emit("chat:created", { chatId });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function decline(req, res) {
  const io = req.app.get("io");
  const ownerId = req.user.id;
  const { requesterId } = req.body;

  if (!requesterId) {
    return res.status(400).json({ message: "Missing target user ID" });
  }

  if (ownerId === requesterId) {
    return res
      .status(400)
      .json({ message: "Cannot decline request on yourself" });
  }

  try {
    const ownerObjId = new ObjectId(ownerId);
    const requesterObjId = new ObjectId(requesterId);
    await friendService.declineService(ownerObjId, requesterObjId);
    res.status(200).json({ message: "Friend request declined" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getFriend(req, res) {
  try {
    const userId = req.user.id;
    const list = await friendService.getFriendList(userId);
    return res.status(200).json({
      success: true,
      data: list,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Failed to get friend list",
    });
  }
}

async function getInbound(req, res) {
  try {
    const userId = req.user.id;
    const list = await friendService.getInboundList(userId);
    return res.json({ success: true, data: list });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to get inbound requests" });
  }
}

async function getOutbound(req, res) {
  try {
    const userId = req.user.id;
    const list = await friendService.getOutboundList(userId);
    return res.json({ success: true, data: list });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to get outbound requests" });
  }
}

module.exports = {
  add,
  remove,
  accept,
  decline,
  getFriend,
  getInbound,
  getOutbound,
};
