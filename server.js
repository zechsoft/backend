// File: server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const auth = require("./middleware/auth");



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());


// Connect to MongoDB
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);


// Protected test route
app.get("/api/protected", auth, (req, res) => {
  res.json({ msg: "This is a protected route", user: req.user });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});