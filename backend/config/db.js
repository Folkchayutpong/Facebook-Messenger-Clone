const mongoose = require("mongoose");
require("dotenv").config();

// conect to mongodb
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
