// controllers/chatController.js
const Message = require('../models/Message');
const User = require('../models/User');

// Get messages between two users
exports.getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    // Find all messages between sender and receiver
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    // Check if users exist
    const senderUser = await User.findOne({ username: sender });
    const receiverUser = await User.findOne({ username: receiver });

    if (!senderUser || !receiverUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create new message
    const newMessage = new Message({
      sender,
      receiver,
      message,
      timestamp: new Date()
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Mark messages as read
exports.markAsRead = async (req, res) => {
  try {
    const { sender, receiver } = req.params;

    // Update all unread messages from sender to receiver
    await Message.updateMany(
      { sender, receiver, read: false },
      { $set: { read: true } }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};