const FriendList = require("./friend.model");
const eventBus = require("../events/eventBus");

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

    return { message: "Request sent" };
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
      return { message: "Users were not friends" };
    }

    await Promise.all([ownerList.save(), targetList.save()]);

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

    //send event to create chat
    eventBus.emit("CreatePrivateChatService", {
      senderId: ownerId,
      receiverId: requesterId,
    });

    return { message: "Friend request accepted" };
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

    return { message: "Friend request declined" };
  } catch (error) {
    throw new Error(error.message);
  }
}

module.exports = {
  addService,
  removeService,
  acceptService,
  declineService,
};
