const mongoose = require('mongoose');

const resumeBuilderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: { type: String, default: 'My Resume' },
    personalInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      website: String,
      summary: String,
    },
    experience: [
      {
        company: String,
        role: String,
        startDate: String,
        endDate: String,
        current: Boolean,
        description: String,
      },
    ],
    education: [
      {
        institution: String,
        degree: String,
        field: String,
        startDate: String,
        endDate: String,
        gpa: String,
      },
    ],
    skills: [String],
    projects: [
      {
        name: String,
        description: String,
        techStack: String,
        link: String,
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        date: String,
        link: String,
      },
    ],
    template: { type: String, default: 'modern' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResumeBuilder', resumeBuilderSchema);