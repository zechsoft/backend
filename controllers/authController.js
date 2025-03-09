const User = require("../models/User");
const Session = require("../models/Session");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register a new user
exports.register = async (req, res) => {
  const { name, email, password, role, avatar } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: "User already exists" });
    }

    // Create a new user
    user = new User({ 
      name, 
      email, 
      password, 
      role: role || "client",  // Default to client if role not provided
      avatar
    });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Save the user
    await user.save();

    // Generate JWT token
    const payload = { 
      user: { 
        id: user.id, 
        role: user.role 
      } 
    };

    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" },  // Extended token expiration to 24 hours
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token,
          user: { 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Login a user
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = { 
      user: { 
        id: user.id, 
        role: user.role 
      } 
    };

    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" },  // Extended token expiration to 24 hours
      async (err, token) => {
        if (err) throw err;
        
        // Generate refresh token
        const refreshToken = jwt.sign(
          { userId: user.id },
          process.env.REFRESH_TOKEN_SECRET,
          { expiresIn: "30d" }
        );
        
        // Save session
        const session = new Session({
          userId: user.id,
          refreshToken,
          userAgent,
          ip
        });
        
        await session.save();
        
        res.json({ 
          token,
          refreshToken,
          user: { 
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar
          }
        });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  
  if (!refreshToken) {
    return res.status(401).json({ msg: "No refresh token, authorization denied" });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    
    // Check if session is valid
    const session = await Session.findOne({ 
      userId: decoded.userId, 
      refreshToken,
      isValid: true
    });
    
    if (!session) {
      return res.status(401).json({ msg: "Invalid refresh token" });
    }
    
    // Get user information
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    
    // Generate new access token
    const payload = { 
      user: { 
        id: user.id, 
        role: user.role 
      } 
    };
    
    jwt.sign(
      payload, 
      process.env.JWT_SECRET, 
      { expiresIn: "24h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(401).json({ msg: "Invalid refresh token" });
  }
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Logout (invalidate session)
exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  
  try {
    if (refreshToken) {
      await Session.findOneAndUpdate(
        { refreshToken },
        { isValid: false }
      );
    }
    
    res.json({ msg: "Logged out successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};