const User = require("./user.model");
const argon2 = require("argon2");

async function registerService(email, username, password) {
  try {
    const existing = await User.findOne({ username: email });

    if (existing) {
      throw new Error("User already exists");
    }

    const passwordHash = await argon2.hash(password);

    const user = new User({
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
    const user = await User.findOne({ username: email }).lean().exec();

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

module.exports = {
  registerService,
  loginService,
};
