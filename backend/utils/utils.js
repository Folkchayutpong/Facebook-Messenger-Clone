const jwt = require("jsonwebtoken");
require("dotenv").config({ path: "./config/.env" });

//generate access token
function generateAccessToken(id, email) {
  return jwt.sign({ id: id, email: email }, process.env.JWT_TOKEN, {
    expiresIn: "1d",
  });
}

module.exports = {
  generateAccessToken,
};
