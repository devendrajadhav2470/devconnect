// 8. SavedPost Schema
const savedPostSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  savedAt: { type: Date, default: Date.now },
});

// REST API Endpoints (SavedPost)
// POST /api/saved/:postId
// DELETE /api/saved/:postId
// GET /api/saved
