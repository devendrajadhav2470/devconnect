// models/Report.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reportSchema = new Schema({
  reporter: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  targetType: {
    type: String,
    enum: ['Post', 'Comment'],
    required: true,
  },

  targetId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType', // Dynamically reference 'Post' or 'Comment'
  },

  reason: {
    type: String,
    required: true,
    trim: true,
  },

  reasonCategory: {
    type: String,
    enum: ['spam', 'hate_speech', 'harassment', 'misinformation', 'other'],
    required: true,
  },

  context: {
    type: String, // e.g., screenshot URL or extra message
  },

  resolved: {
    type: Boolean,
    default: false,
  },

  actionTaken: {
    type: String, // e.g., "post removed", "user warned"
  },

  actionTakenBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },

  actionTakenAt: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient moderation queries
reportSchema.index({ reporter: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ resolved: 1 });
reportSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Report', reportSchema);
