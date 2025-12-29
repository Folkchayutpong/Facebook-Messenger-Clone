const User = require("./user.model");
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
  return url.replace(
    `https://storage.googleapis.com/${bucketName}/`,
    ""
  );
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
module.exports = {
  registerService,
  loginService,
  updateUserProfileService,
  uploadAvatarService,
};
