const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const { analyzeResume } = require('../utils/gemini');

// @desc    Upload and analyze resume
// @route   POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    // Parse PDF text
    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF. Please ensure the PDF is not scanned/image-based.' });
    }

    // Call Gemini AI for analysis
    const analysis = await analyzeResume(rawText);

    // Save to DB
    const resume = await Resume.create({
      user: req.user._id,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      rawText,
      atsScore: analysis.atsScore,
      extractedSkills: analysis.extractedSkills || [],
      missingSkills: analysis.missingSkills || [],
      improvements: analysis.improvements || [],
      jobRecommendations: analysis.jobRecommendations || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      overallFeedback: analysis.overallFeedback || '',
      isAnalyzed: true,
      analysisDate: new Date(),
    });

    // Update user skills and resume count
    await User.findByIdAndUpdate(req.user._id, {
      $set: { skills: analysis.extractedSkills || [] },
      $inc: { resumeCount: 1 },
    });

    res.status(201).json({
      success: true,
      message: 'Resume analyzed successfully',
      resume,
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Analysis failed. Please try again.' });
  }
};

// @desc    Get all user resumes
// @route   GET /api/resume
const getResumes = async (req, res) => {
  try {
    const resumes = await Resume.find({ user: req.user._id })
      .select('-rawText')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: resumes.length, resumes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single resume analysis
// @route   GET /api/resume/:id
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    res.json({ success: true, resume });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete resume
// @route   DELETE /api/resume/:id
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResume, getResumes, getResumeById, deleteResume };