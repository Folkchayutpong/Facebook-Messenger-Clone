const friendService = require("./friend.service");

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
    const result = await friendService.addService(ownerId, targetId);
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
    const result = await friendService.removeService(ownerId, targetId);
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
    const result = await friendService.acceptService(ownerId, requesterId);
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
    const result = await friendService.declineService(ownerId, requesterId);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


