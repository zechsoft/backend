const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Get all users (admin only)
router.get("/", auth, userController.getAllUsers);

// Get user by ID (admin or own profile)
router.get("/:userId", auth, userController.getUserById);

// Update user (admin or own profile)
router.put("/:userId", auth, userController.updateUser);

// Delete user (admin only)
router.delete("/:userId", auth, userController.deleteUser);

module.exports = router;