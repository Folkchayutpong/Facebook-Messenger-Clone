const mongoose = require("mongoose");
require("dotenv").config();

// conect to mongodb
try {
  mongoose.connect(process.env.MONGODB_URL);
  console.log("Connected to MongoDB");
} catch (e) {
  console.error("MongoDB connection error:", err);
}

module.exports = mongoose;
