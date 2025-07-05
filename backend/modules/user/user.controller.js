const zxcvbn = require("zxcvbn");
const userService = require("./user.service");
const utils = require("../../utils/utils");
const { redisClient } = require("../../config/redis");

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

module.exports = {
  register,
  login,
};
