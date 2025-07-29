const friendService = require("./friend.service");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

async function add(req, res) {
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
    const result = await friendService.addService(ownerObjId, targetObjId);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
}

async function remove(req, res) {
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
    const result = await friendService.removeService(ownerObjId, targetObjId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function accept(req, res) {
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
    const result = await friendService.acceptService(
      ownerObjId,
      requesterObjId
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function decline(req, res) {
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
    const result = await friendService.declineService(
      ownerObjId,
      requesterObjId
    );
    res.status(200).json(result);
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
  getOutbound
};
