const jwt = require("jsonwebtoken");
const cookie = require("cookie");

//generate access token
function generateAccessToken(id, email) {
  return jwt.sign({ id: id, email: email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
}

const parseTokenFromCookie = (cookieString) => {
  if (!cookieString) return null;
  const cookies = cookie.parse(cookieString);
  return cookies.token;
};

const timeStr = (date) => {
  return date.toLocaleTimeString("th-TH", {
    timeZone: "Asia/Bangkok",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

module.exports = {
  generateAccessToken,
  parseTokenFromCookie,
  timeStr,
};
