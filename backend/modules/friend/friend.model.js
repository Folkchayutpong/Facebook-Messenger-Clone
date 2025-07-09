const mongoose = require("mongoose");

const friendlistSchema = new mongoose.Schema({
  owner: { 
    type: mongoose.Schema.Types.ObjectId, ref: "User",
    required: true,
  },

  friends: [{
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  }],

  inbound: [{
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  }],

  outbound: [{
    type: mongoose.Schema.Types.ObjectId, ref: "User"
  }],
});

const FriendList = mongoose.model("FriendList", friendlistSchema);

module.exports = FriendList;
