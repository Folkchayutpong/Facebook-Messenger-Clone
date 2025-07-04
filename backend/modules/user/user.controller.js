const body = require("express-validator");
const zxcvbn = require("zxcvbn");
const userService = require("./user.service");

async function register(req, res) {
  const { username, password } = req.body;

  if (body(username).isEmpty() || body(password).isEmpty()) {
    return res.status(400).json({ message: "Missing username or password" });
  }

  if (zxcvbn(password).score < 3) {
    return res.status(400).json({
      message: "Weak password",
      suggestions: zxcvbn(password).feedback.suggestions,
    });
  }

  try {
    const user = await userService.registerService(username, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

module.exports = {
  register,
};
