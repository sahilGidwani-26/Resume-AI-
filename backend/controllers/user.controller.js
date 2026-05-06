const User = require('../models/User.model');
const Resume = require('../models/Resume.model');
const ResumeBuilder = require('../models/ResumeBuilder.model');

// @desc    Get user dashboard stats
// @route   GET /api/user/dashboard
const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;

    const [resumes, builtResumes] = await Promise.all([
      Resume.find({ user: userId }).select('atsScore fileName createdAt isAnalyzed extractedSkills').sort({ createdAt: -1 }).limit(5),
      ResumeBuilder.find({ user: userId }).select('title updatedAt').sort({ updatedAt: -1 }).limit(3),
    ]);

    const avgAts = resumes.length > 0
      ? Math.round(resumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / resumes.length)
      : 0;

    const allSkills = [...new Set(resumes.flatMap(r => r.extractedSkills || []))];

    res.json({
      success: true,
      stats: {
        totalResumes: resumes.length,
        avgAtsScore: avgAts,
        totalSkills: allSkills.length,
        builtResumes: builtResumes.length,
      },
      recentResumes: resumes,
      recentBuilds: builtResumes,
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, targetRole, experience, skills } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, targetRole, experience, skills },
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Save/update resume builder
// @route   POST /api/user/resume-builder
const saveResumeBuilder = async (req, res) => {
  try {
    const { id, ...data } = req.body;

    let builtResume;
    if (id) {
      builtResume = await ResumeBuilder.findOneAndUpdate(
        { _id: id, user: req.user._id },
        { ...data },
        { new: true }
      );
    } else {
      builtResume = await ResumeBuilder.create({ user: req.user._id, ...data });
    }

    res.json({ success: true, message: 'Resume saved', resume: builtResume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get resume builder data
// @route   GET /api/user/resume-builder/:id
const getResumeBuilder = async (req, res) => {
  try {
    const resume = await ResumeBuilder.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all built resumes
// @route   GET /api/user/resume-builder
const getAllBuiltResumes = async (req, res) => {
  try {
    const resumes = await ResumeBuilder.find({ user: req.user._id }).sort({ updatedAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboard, updateProfile, saveResumeBuilder, getResumeBuilder, getAllBuiltResumes };