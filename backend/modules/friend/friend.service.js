const FriendList = require("./friend.model");
const eventBus = require("../events/eventBus");
const User = require("../user/user.model");

async function ensureFriendList(userId) {
  let list = await FriendList.findOne({ owner: userId });
  if (!list) {
    list = new FriendList({
      owner: userId,
      friends: [],
      inbound: [],
      outbound: [],
    });
    await list.save();
  }
  return list;
}

async function addService(ownerId, targetId) {
  try {
    const [ownerList, targetList] = await Promise.all([
      ensureFriendList(ownerId),
      ensureFriendList(targetId),
    ]);

    if (!ownerList || !targetList) throw new Error("Friend list not found");

    if (ownerList.friends.includes(targetId)) {
      throw new Error("Already friends");
    }
    if (ownerList.outbound.includes(targetId)) {
      throw new Error("Friend request already sent");
    }
    if (targetList.inbound.includes(ownerId)) {
      throw new Error("Friend request already received");
    }

    ownerList.outbound.push(targetId);
    targetList.inbound.push(ownerId);

    await Promise.all([ownerList.save(), targetList.save()]);
    const ownerUser = await User.findById(ownerId).select(
      "_id username avatar"
    );
    return ownerUser;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removeService(ownerId, targetId) {
  try {
    if (ownerId === targetId) throw new Error("Cannot unfriend yourself");

    const [ownerList, targetList] = await Promise.all([
      ensureFriendList(ownerId),
      ensureFriendList(targetId),
    ]);

    if (!ownerList || !targetList) throw new Error("Friend list not found");

    const oldOwnerCount = ownerList.friends.length;
    const oldTargetCount = targetList.friends.length;

    ownerList.friends = ownerList.friends.filter(
      (id) => id.toString() !== targetId.toString()
    );
    targetList.friends = targetList.friends.filter(
      (id) => id.toString() !== ownerId.toString()
    );

    if (
      ownerList.friends.length === oldOwnerCount &&
      targetList.friends.length === oldTargetCount
    ) {
      throw new Error("Users were not friends");
    }

    eventBus.emit("RemovePrivateChatService", {
      senderId: ownerId,
      receiverId: targetId,
    });

    await Promise.all([ownerList.save(), targetList.save()]);
    await User.findById(targetId).select("_id username avatar");
    return { message: "Friend removed" };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function acceptService(ownerId, requesterId) {
  try {
    const [ownerList, requesterList] = await Promise.all([
      ensureFriendList(ownerId),
      ensureFriendList(requesterId),
    ]);

    if (!ownerList || !requesterList) throw new Error("Friend list not found");

    ownerList.inbound = ownerList.inbound.filter(
      (id) => id.toString() !== requesterId.toString()
    );
    requesterList.outbound = requesterList.outbound.filter(
      (id) => id.toString() !== ownerId.toString()
    );

    if (!ownerList.friends.includes(requesterId)) {
      ownerList.friends.push(requesterId);
    }
    if (!requesterList.friends.includes(ownerId)) {
      requesterList.friends.push(ownerId);
    }

    await Promise.all([ownerList.save(), requesterList.save()]);

    const [ownerUser, requesterUser] = await Promise.all([
      User.findById(ownerId).select("_id username avatar"),
      User.findById(requesterId).select("_id username avatar"),
    ]);

    //send event to create chat
    eventBus.emit("CreatePrivateChatService", {
      senderId: ownerId,
      senderName: ownerUser.username,
      receiverId: requesterId,
      receiverName: requesterUser.username,
    });

    return { ownerUser, requesterUser };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function declineService(ownerId, requesterId) {
  try {
    const [ownerList, requesterList] = await Promise.all([
      ensureFriendList(ownerId),
      ensureFriendList(requesterId),
    ]);

    if (!ownerList || !requesterList) throw new Error("Friend list not found");

    ownerList.inbound = ownerList.inbound.filter(
      (id) => id.toString() !== requesterId.toString()
    );
    requesterList.outbound = requesterList.outbound.filter(
      (id) => id.toString() !== ownerId.toString()
    );
    await Promise.all([ownerList.save(), requesterList.save()]);
    const ownerUser = await User.findById(ownerId).select(
      "_id username avatar"
    );
    return ownerUser;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function getFriendList(userId) {
  const list = await FriendList.findOne({ owner: userId }).populate(
    "friends",
    "_id username email avatar"
  );
  if (!list) throw new Error("Friend list not found");
  return list.friends;
}

async function getInboundList(userId) {
  const list = await FriendList.findOne({ owner: userId }).populate(
    "inbound",
    "_id username email avatar"
  );
  if (!list) throw new Error("Inbound list not found");
  return list.inbound;
}

async function getOutboundList(userId) {
  const list = await FriendList.findOne({ owner: userId }).populate(
    "outbound",
    "_id username email avatar"
  );
  if (!list) throw new Error("Outbound list not found");
  return list.outbound;
}

module.exports = {
  addService,
  removeService,
  acceptService,
  declineService,
  getFriendList,
  getInboundList,
  getOutboundList,
};
