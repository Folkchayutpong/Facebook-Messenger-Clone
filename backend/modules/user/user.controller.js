const zxcvbn = require("zxcvbn");
const userService = require("./user.service");
const utils = require("../../utils/utils");
const { redisClient } = require("../../config/redis");
const User = require("./user.model");


async function register(req, res) {
  const { email, username, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid or missing email" });
  }

  if (!username || !password) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  if (zxcvbn(password).score < 3) {
    return res.status(400).json({
      message: "Weak password",
      suggestions: zxcvbn(password).feedback.suggestions,
    });
  }

  try {
    const user = await userService.registerService(email, username, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "Invalid or missing email" });
  }

  if (!password) {
    return res.status(400).json({ message: "Missing password" });
  }

  try {
    const user = await userService.loginService(email, password);
    const token = utils.generateAccessToken(user.id, user.email);
    //TODO: implements redis
    const redisKey = `token:${user.id}`;
    await redisClient.set(redisKey, token);

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, //change to true if use https
      sameSite: "Strict",
      maxAge: 60 * 60 * 1000,
    });
    res.status(200).json({ user: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
async function getUserProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("username email avatar");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

async function getUserProfileById(req, res) {
  try {
    const user = await User.findById(req.params.id).select("username email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
}

async function uploadAvatar(req, res) {
    try {
    const avatarUrl = await userService.uploadAvatarService( req.user.id, req.file);
    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateUserProfile(req, res) {
  try {
    const { username, avatar } = req.body;

    const updateFields = {};

    if (username !== undefined) {
      updateFields.username = username;
    }

    if (avatar !== undefined) {
      updateFields.avatar = avatar;
    }
    //no changes
    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const updatedUser = userService.updateUserProfileService(req.user.id, updateFields);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error("patchUserProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
}

async function searchUsers(req, res) {
  try {
    const { username } = req.query;

    const users = await userService.searchUsersService({
      keyword: username,
      currentUserId: req.user.id,
    });

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
module.exports = {
  register,
  login,
  getUserProfile,
  getUserProfileById,
  updateUserProfile,
  uploadAvatar,
  searchUsers
  
};
