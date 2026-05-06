const { generateJobDescription } = require('../utils/gemini');
const Resume = require('../models/Resume.model');

// @desc    Get AI job recommendations based on latest resume
// @route   GET /api/jobs/recommendations
const getJobRecommendations = async (req, res) => {
  try {
    const latestResume = await Resume.findOne({ user: req.user._id, isAnalyzed: true })
      .sort({ createdAt: -1 });

    if (!latestResume) {
      return res.status(404).json({ success: false, message: 'No analyzed resume found. Please upload a resume first.' });
    }

    // Return job recommendations from the latest resume analysis
    res.json({
      success: true,
      jobs: latestResume.jobRecommendations,
      basedOn: latestResume.fileName,
      skills: latestResume.extractedSkills,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get personalized job recommendations via AI
// @route   POST /api/jobs/search
const searchJobs = async (req, res) => {
  try {
    const { skills, experience, targetRole } = req.body;

    if (!skills || skills.length === 0) {
      return res.status(400).json({ success: false, message: 'Skills are required' });
    }

    const result = await generateJobDescription(skills, experience || '0-2 years', targetRole || '');

    res.json({
      success: true,
      jobs: result.jobs || [],
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getJobRecommendations, searchJobs };