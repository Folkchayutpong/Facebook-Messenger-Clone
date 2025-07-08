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
    const ownerObjId = new ObjectId("686d03258637257dbee1f501");
    const targetObjId = new ObjectId(targetId);
    console.log(ownerObjId, targetObjId);
    const result = await friendService.addService(ownerObjId, targetObjId);
    res.status(200).json(result);
  } catch (err) {
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
     return res.status(400).json({ message: "Cannot remove friend on yourself" });
   }

  try {
    const ownerObjId = new ObjectId("686d03258637257dbee1f501");
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
     return res.status(400).json({ message: "Cannot accept request on yourself" });
   }

  try {
    const ownerObjId = new ObjectId("686d033c8637257dbee1f505");
    const requesterObjId = new ObjectId(requesterId);
    const result = await friendService.acceptService(ownerObjId, requesterObjId);
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
     return res.status(400).json({ message: "Cannot decline request on yourself" });
   }

  try {
    const ownerObjId = new ObjectId("686d033c8637257dbee1f505");
    const requesterObjId = new ObjectId(requesterId);
    const result = await friendService.declineService(ownerObjId, requesterObjId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
    add,
    remove,
    accept,
    decline
}

