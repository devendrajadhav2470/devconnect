const User = require('../models/User');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Check for existing user
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(409).json({ message: 'Username or email already exists.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the user
    const user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Return success (omit password)
    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      message: 'User registered successfully.',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Sign JWT
    // const token = jwt.sign(
    //   { userId: user._id, username: user.username },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    // res.json({
    //   token,
    //   user: {
    //     id: user._id,
    //     username: user.username,
    //     email: user.email
    //   },
    //   message: 'Login successful.'
    // });
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: { // Ensure this user object is included
        id: user._id,
        username: user.username,
        email: user.email
      },
      message: 'Login successful.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    console.log("getProfile user:", user);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { bio, image, skills } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { bio, image, skills },
      { new: true, runValidators: true, context: 'query' }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json({ user: updatedUser, message: 'Profile updated successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Follow a user
exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id; // User to follow
    const currentUserId = req.user.userId; // User who is following

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if already following
    if (currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'Already following this user.' });
    }

    currentUser.following.push(targetUserId);
    targetUser.followers.push(currentUserId);

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'User followed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id; // User to unfollow
    const currentUserId = req.user.userId; // User who is unfollowing

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: 'You cannot unfollow yourself.' });
    }

    const targetUser = await User.findById(targetUserId);
    const currentUser = await User.findById(currentUserId);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if currently following
    if (!currentUser.following.includes(targetUserId)) {
      return res.status(400).json({ message: 'You are not following this user.' });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== targetUserId
    );
    targetUser.followers = targetUser.followers.filter(
      (id) => id.toString() !== currentUserId
    );

    await currentUser.save();
    await targetUser.save();

    res.json({ message: 'User unfollowed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get followers of a user
exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('followers', 'username email image');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user.followers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get users a user is following
exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId).populate('following', 'username email image');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user.following);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
