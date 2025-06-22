// models/Post.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Embedded Comment Schema
const commentSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId(),
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  likes: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  parentCommentId: {
    type: Schema.Types.ObjectId, // Reference to another comment in the same post
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'moderated', 'deleted'],
    default: 'active',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Media Metadata Schema
const mediaItemSchema = new Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ['image', 'video'], required: true },
  thumbnail: { type: String }, // Only for videos
  width: { type: Number },
  height: { type: Number },
});

const postSchema = new Schema({
  content: { type: String, required: true, trim: true },

  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'link'],
    default: 'text',
  },

  tags: [{ type: String, lowercase: true }],

  mentions: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  status: {
    type: String,
    enum: ['published', 'draft', 'archived', 'hidden'],
    default: 'published',
  },

  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],

  commentsCount: { type: Number, default: 0 },
  likesCount: { type: Number, default: 0 },

  media: [mediaItemSchema],
}, {
  timestamps: true,
});

// Indexes for performance and search
postSchema.index({ author: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ likes: 1 });
postSchema.index({ content: 'text' });

module.exports = mongoose.model('Post', postSchema);
