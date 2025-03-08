const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", authController.login);

// Get current user profile
router.get("/me", auth, authController.getUserProfile);

// Validate token route (new)
router.post("/validate-token", authController.validateToken);

module.exports = router;