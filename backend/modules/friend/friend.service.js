const FriendList = require("./friend.model");

async function addService(ownerId, targetId) {
  try {
    const [ownerList, targetList] = await Promise.all([
      FriendList.findOne({ owner: ownerId }),
      FriendList.findOne({ owner: targetId }),
    ]);

    if (!ownerList || !targetList) throw new Error("Friend list not found");

    if (ownerList.friends.includes(targetId)) {
      throw new Error("Already friends");
    }

    ownerList.outbound.push(targetId);
    targetList.inbound.push(ownerId);

    await Promise.all([ownerList.save(), targetList.save()]);

    return { message: "Request sent" };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function acceptService(ownerId, requesterId) {
  try {
    const [ownerList, requesterList] = await Promise.all([
      FriendList.findOne({ owner: ownerId }),
      FriendList.findOne({ owner: requesterId }),
    ]);

    if (!ownerList || !requesterList) throw new Error("Friend list not found");

    ownerList.inbound = ownerList.inbound.filter(
      (id) => id.toString() !== requesterId
    );
    requesterList.outbound = requesterList.outbound.filter(
      (id) => id.toString() !== ownerId
    );

    ownerList.friends.push(requesterId);
    requesterList.friends.push(ownerId);

    await Promise.all([ownerList.save(), requesterList.save()]);

    return { message: "Friend request accepted" };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function declineService(ownerId, requesterId) {
  try {
    const [ownerList, requesterList] = await Promise.all([
      FriendList.findOne({ owner: ownerId }),
      FriendList.findOne({ owner: requesterId }),
    ]);

    if (!ownerList || !requesterList) throw new Error("Friend list not found");

    ownerList.inbound = ownerList.inbound.filter(
      (id) => id.toString() !== requesterId
    );
    requesterList.outbound = requesterList.outbound.filter(
      (id) => id.toString() !== ownerId
    );
    await Promise.all([ownerList.save(), requesterList.save()]);

    return { message: "Friend request rejected" };
  } catch (error) {
    throw new Error(error.message);
  }
}

async function removefriendService(ownerId, targetId) {
  try {
    if (ownerId === targetId) throw new Error("Cannot unfriend yourself");

    const [ownerList, targetList] = await Promise.all([
      FriendList.findOne({ owner: ownerId }),
      FriendList.findOne({ owner: targetId }),
    ]);

    if (!ownerList || !targetList) throw new Error("Friend list not found");

    const oldOwnerCount = ownerList.friends.length;
    const oldTargetCount = targetList.friends.length;

    ownerList.friends = ownerList.friends.filter(
      (id) => id.toString() !== targetId
    );
    targetList.friends = targetList.friends.filter(
      (id) => id.toString() !== ownerId
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
