const User = require("../models/User");

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    // Check if requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to access this resource" });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all users with specific role (admin only)
exports.getUsersByRole = async (req, res) => {
  try {
    // Check if requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to access this resource" });
    }
    const { role } = req.query;
    const query = role ? { role } : {};
    
    const users = await User.find(query).select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get all client users for public display (no auth required)
exports.getPublicClientUsers = async (req, res) => {
  try {
    // Find all users with role "client" and return only safe fields
    const clientUsers = await User.find({ role: "client" })
      .select('name email avatar')
      .lean();
    
    res.json(clientUsers);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

// Get user by ID (admin or own profile)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if requesting user is admin or own profile
    if (req.user.role !== "admin" && req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: "Not authorized to access this profile" });
    }

    res.json(user);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Update user (admin or own profile)
exports.updateUser = async (req, res) => {
  const { name, email, role, avatar } = req.body;

  try {
    let user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Check if requesting user is admin or own profile
    if (req.user.role !== "admin" && req.user.id !== req.params.userId) {
      return res.status(403).json({ msg: "Not authorized to update this profile" });
    }

    // Only admin can change role
    if (role && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to change role" });
    }

    // Update user fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (role && req.user.role === "admin") user.role = role;

    await user.save();

    // Return user without password
    const updatedUser = await User.findById(req.params.userId).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    // Check if requesting user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not authorized to delete users" });
    }

    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.deleteOne();

    res.json({ msg: 'User removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server Error');
  }
};