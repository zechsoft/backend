const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const auth = require('../middleware/auth');

// Get messages between two users
router.get('/messages/:sender/:receiver', auth, chatController.getMessages);

// Send a message
router.post('/messages/send', auth, chatController.sendMessage);

// Mark messages as read
router.put('/messages/read/:sender/:receiver', auth, chatController.markAsRead);

module.exports = router;