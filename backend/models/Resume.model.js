const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: { type: String, required: true },
    fileSize: { type: Number },
    rawText: { type: String },
    // AI Analysis Results
    atsScore: { type: Number, min: 0, max: 100 },
    missingSkills: [{ type: String }],
    extractedSkills: [{ type: String }],
    improvements: [{ type: String }],
    jobRecommendations: [
      {
        title: String,
        matchScore: Number,
        description: String,
        requiredSkills: [String],
        salaryRange: String,
      },
    ],
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    overallFeedback: { type: String },
    isAnalyzed: { type: Boolean, default: false },
    analysisDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);