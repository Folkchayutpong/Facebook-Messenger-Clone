const jwt = require("jsonwebtoken");
const cookie = require("cookie");
require("dotenv").config({ path: "./config/.env" });
//generate access token
function generateAccessToken(id, email) {
  return jwt.sign({ id: id, email: email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

const parseTokenFromCookie = (cookieString) => {
  const cookies = cookie.parse(cookieString);
  return cookies.token;
};

module.exports = {
  generateAccessToken,
  parseTokenFromCookie,
};
