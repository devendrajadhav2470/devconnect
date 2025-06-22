const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, index: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true }, // Hashed
  
  // Profile
  bio:      { type: String, default: '', maxLength: 500 },
  image:    { type: String, default: 'https://via.placeholder.com/150?text=User' }, // Default avatar
  skills:   [{ type: String, trim: true }],
  location: { type: String, trim: true },
  website:  { type: String, trim: true },
  github:   { type: String, trim: true },
  linkedin: { type: String, trim: true },

  // Social Graph
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }], // Users who follow this user
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true }],  // Users this user follows

  // Auth & Status
  status: { type: String, enum: ['active', 'pending_verification', 'suspended', 'deactivated'], default: 'active' },
  roles: [{ type: String, enum: ['user', 'admin', 'moderator'], default: 'user' }],
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String, // For email verification flow
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: { type: Date },

  // Privacy (optional, depending on complexity)
  profileVisibility: { type: String, enum: ['public', 'connections', 'private'], default: 'public' },
  notificationSettings: {
    emailOnFollow: { type: Boolean, default: true },
    emailOnLike: { type: Boolean, default: true },
    // ... more notification types
  }
}, { timestamps: true }); // createdAt, updatedAt

// Add full-text search index for username and bio
userSchema.index({ username: 'text', bio: 'text', skills: 'text' });

module.exports = mongoose.model('User', userSchema);
