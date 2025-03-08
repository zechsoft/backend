    const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  refreshToken: { 
    type: String, 
    required: true 
  },
  userAgent: { 
    type: String 
  },
  ip: { 
    type: String 
  },
  isValid: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now, 
    expires: 30 * 24 * 60 * 60 // Auto-delete after 30 days
  }
});

module.exports = mongoose.model("Session", SessionSchema);