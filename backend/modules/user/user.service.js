const User = require("./user.model");
const { v4: uuidv4 } = require("uuid");
const argon2 = require("argon2");

async function registerService(username, password) {
  existing = User.findOne({ username: username });
  if (existing) {
    throw new Error("User already exists");
  }

  uuid = uuidv4();
  passwordHash = argon2.hash(password);
  user = new User({ id: uuid, username: username, password: passwordHash });
  await user.save();
  return user;
}

module.exports = {
  registerService,
};
