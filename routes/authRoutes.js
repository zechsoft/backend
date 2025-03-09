const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register route
router.post("/register", authController.register);

// Login route
router.post("/login", authController.login);

// Refresh token route
router.post("/refresh-token", authController.refreshToken);

// Logout route
router.post("/logout", authController.logout);

// Get current user profile
router.get("/me", auth, authController.getUserProfile);

module.exports = router;