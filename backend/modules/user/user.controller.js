const zxcvbn = require("zxcvbn");
const userService = require("./user.service");
const generateAccessToken = require("../../utils/utils");

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
    const token = generateAccessToken(user.id, user.email);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  register,
  login,
};
