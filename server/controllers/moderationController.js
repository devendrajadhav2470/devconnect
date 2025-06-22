const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { type: String, enum: ['Post', 'Comment'], required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false }
});

const Report = mongoose.model('Report', reportSchema);

// Controller for reporting
exports.reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Reason is required.' });
    }
    const report = new Report({
      reporter: req.user.userId,
      targetType: 'Post',
      targetId: postId,
      reason
    });
    await report.save();
    res.status(201).json({ message: 'Post reported successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.reportComment = async (req, res) => {
  try {
    const { postId, commentId } = req.params;
    const { reason } = req.body;
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ message: 'Reason is required.' });
    }
    const report = new Report({
      reporter: req.user.userId,
      targetType: 'Comment',
      targetId: commentId,
      reason
    });
    await report.save();
    res.status(201).json({ message: 'Comment reported successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: get all reports
exports.getReports = async (req, res) => {
  try {
    // For simplicity, no auth role check here, but should be added
    const reports = await Report.find().populate('reporter', 'username email').sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Admin: resolve a report
exports.resolveReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ message: 'Report not found.' });
    }
    report.resolved = true;
    await report.save();
    res.json({ message: 'Report resolved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
