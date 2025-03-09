const Session = require("../models/Session");

// Create a new session
exports.createSession = async (req, res) => {
  try {
    const { userId, refreshToken, userAgent, ip } = req.body;
    
    const session = new Session({
      userId,
      refreshToken,
      userAgent,
      ip
    });
    
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all sessions for a user
exports.getUserSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Invalidate a session
exports.invalidateSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    
    // Check if the session belongs to the user or if the user is an admin
    if (session.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to invalidate this session" });
    }
    
    session.isValid = false;
    await session.save();
    
    res.json({ msg: 'Session invalidated' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Delete a session
exports.deleteSession = async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ msg: 'Session not found' });
    }
    
    // Check if the session belongs to the user or if the user is an admin
    if (session.userId.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to delete this session" });
    }
    
    await session.deleteOne();
    
    res.json({ msg: 'Session deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};