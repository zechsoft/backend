const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const auth = require("../middleware/auth");

// Create a new session
router.post("/", auth, sessionController.createSession);

// Get all sessions for a user
router.get("/me", auth, sessionController.getUserSessions);

// Invalidate a session
router.put("/:sessionId/invalidate", auth, sessionController.invalidateSession);

// Delete a session
router.delete("/:sessionId", auth, sessionController.deleteSession);

module.exports = router; 