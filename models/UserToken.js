const mongoose = require("mongoose");

const UserTokenSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true,
    ref: 'User'
  },
  token: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now,
    expires: 30*24*60*60 // 30 days in seconds
  }
});

module.exports = mongoose.model("UserToken", UserTokenSchema);