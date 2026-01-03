const User = require("./user.model");
const FriendList = require("../friend/friend.model");
const argon2 = require("argon2");
const { bucket } = require("../../config/firebase");
const path = require("path");

async function registerService(email, username, password) {
  try {
    const existing = await User.findOne({ email: email });
    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await argon2.hash(password);

    const user = new User({
      email: email,
      username: username,
      password: passwordHash,
    });

    await user.save();
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function loginService(email, password) {
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await argon2.verify(user.password, password);
    if (!isPasswordValid) {
      throw new Error("Password is incorrect");
    }
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
}

async function updateUserProfileService(userId, updateFields) {
  return User.findByIdAndUpdate(userId, updateFields, {
    new: true,
    runValidators: true,
  }).select("username email avatar");
}

function getFilePathFromUrl(url, bucketName) {
  // https://storage.googleapis.com/{bucket}/{path}
  return url.replace(`https://storage.googleapis.com/${bucketName}/`, "");
}

async function uploadAvatarService(userId, uploadedFile) {
  if (!uploadedFile) {
    throw new Error("No file uploaded");
  }
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");
  if (user.avatar) {
    try {
      const oldFilePath = getFilePathFromUrl(user.avatar, bucket.name);
      await bucket.file(oldFilePath).delete();
    } catch (err) {
      // ไม่ต้อง throw ก็ได้ (กันเคสไฟล์หาย)
      console.warn("Failed to delete old avatar:", err.message);
    }
  }
  const ext = path.extname(uploadedFile.originalname);
  const fileName = `avatars/${userId}-${Date.now()}${ext}`;

  const bucketFile = bucket.file(fileName);

  return new Promise((resolve, reject) => {
    const stream = bucketFile.createWriteStream({
      metadata: {
        contentType: uploadedFile.mimetype,
      },
    });

    stream.on("error", (err) => {
      reject(err);
    });

    stream.on("finish", async () => {
      try {
        await bucketFile.makePublic();

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve(publicUrl);
      } catch (err) {
        reject(err);
      }
    });

    stream.end(uploadedFile.buffer);
  });
}

async function searchUsersService({ keyword, currentUserId }) {
  const users = await User.find({
    _id: { $ne: currentUserId },
    username: { $regex: keyword, $options: "i" },
  });

  // หา FriendList ของ currentUser
  const myFriendList = await FriendList.findOne({ owner: currentUserId });

  return users.map((u) => {
    let status = "none";

    if (myFriendList) {
      // เช็คว่าเป็นเพื่อนแล้ว
      if (myFriendList.friends.some(friendId => friendId.equals(u._id))) {
        status = "friend";
      }
      // เช็คว่ากำลังรอการตอบรับ (เราส่งคำขอไป)
      else if (myFriendList.outbound.some(friendId => friendId.equals(u._id))) {
        status = "pending";
      }
      // เช็คว่ามีคำขอเข้ามา (เขาส่งมาหาเรา)
      else if (myFriendList.inbound.some(friendId => friendId.equals(u._id))) {
        status = "pending";
      }
    }

    return {
      _id: u._id,
      username: u.username,
      friendStatus: status,
    };
  });
}
module.exports = {
  registerService,
  loginService,
  updateUserProfileService,
  uploadAvatarService,
  searchUsersService,
};
