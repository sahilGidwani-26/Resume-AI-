const mongoose = require('mongoose');

const questionResultSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, default: 'General' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
  answer: { type: String, default: '' },
  score: { type: Number, default: 0, min: 0, max: 100 },
  feedback: { type: mongoose.Schema.Types.Mixed, default: null },
}, { _id: false });

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  role: { type: String, default: 'General' },
  level: { type: String, default: 'Junior' },
  totalQuestions: { type: Number, default: 0 },
  answered: { type: Number, default: 0 },
  avgScore: { type: Number, default: 0, min: 0, max: 100 },
  questions: [questionResultSchema],
  finalReport: { type: mongoose.Schema.Types.Mixed, default: null },
}, {
  timestamps: true,   // adds createdAt and updatedAt automatically
});

// Index for fast per-user queries sorted by date
interviewSessionSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);