// 7. Notification Schema
const notificationSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  type: { type: String, enum: ['like', 'comment', 'follow', 'mention', 'message', 'system'] },
  from: { type: Schema.Types.ObjectId, ref: 'User' },
  entityType: String,
  entityId: Schema.Types.ObjectId,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// REST API Endpoints (Notification)
// GET /api/notifications
// PUT /api/notifications/:id/read
