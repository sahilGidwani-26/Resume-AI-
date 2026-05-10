const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Meta
    slug: { type: String, unique: true, required: true }, // e.g. "sahil-gidwani-a3f2"
    isPublished: { type: Boolean, default: true },

    // Personal info
    name:       { type: String, required: true },
    title:      { type: String, default: '' },   // "Full Stack Developer"
    email:      { type: String, default: '' },
    phone:      { type: String, default: '' },
    location:   { type: String, default: '' },
    linkedin:   { type: String, default: '' },
    github:     { type: String, default: '' },
    website:    { type: String, default: '' },
    bio:        { type: String, default: '' },
    avatar:     { type: String, default: '' }, // initials-based, no file upload

    // Content
    skills:       [{ type: String }],
    experience: [
      {
        company:     String,
        role:        String,
        duration:    String,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree:      String,
        year:        String,
      },
    ],
    projects: [
      {
        name:        String,
        description: String,
        techStack:   [String],
        liveUrl:     String,
        githubUrl:   String,
      },
    ],
    certifications: [{ name: String, issuer: String, year: String }],

    // Source
    generatedFrom: { type: String, enum: ['form', 'resume'], default: 'form' },

    // Analysis
    analysisScore:    { type: Number, default: null },
    analysisReport:   { type: mongoose.Schema.Types.Mixed, default: null },
    lastAnalyzedAt:   { type: Date, default: null },

    // Stats
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Portfolio', portfolioSchema);