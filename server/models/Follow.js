// 5. Follow Schema
const followSchema = new Schema({
  follower: { type: Schema.Types.ObjectId, ref: 'User' },
  following: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});


// REST API Endpoints (Follow)
// POST /api/follow/:userId
// DELETE /api/unfollow/:userId
// GET /api/followers/:userId
// GET /api/following/:userId
