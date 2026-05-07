const pdfParse = require('pdf-parse');
const Resume = require('../models/Resume.model');
const User = require('../models/User.model');
const {
  analyzeResume,
  generateRoadmapFromForm,
  generateRoadmapFromResume,
  generateInterviewFromForm,
  generateInterviewFromResume,
} = require('../utils/gemini');

// @desc    Upload and analyze resume
// @route   POST /api/resume/upload
const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF.' });
    }

    const analysis = await analyzeResume(rawText);

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

    await User.findByIdAndUpdate(req.user._id, {
      $set: { skills: analysis.extractedSkills || [] },
      $inc: { resumeCount: 1 },
    });

    res.status(201).json({ success: true, message: 'Resume analyzed successfully', resume });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: error.message || 'Analysis failed.' });
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

// @desc    Get single resume
// @route   GET /api/resume/:id
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
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
    if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });
    await User.findByIdAndUpdate(req.user._id, { $inc: { resumeCount: -1 } });
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Generate roadmap from form
// @route   POST /api/resume/roadmap
const roadmapFromForm = async (req, res) => {
  try {
    const { role, skills, experience, timeline } = req.body;
    if (!role || !skills || !timeline) {
      return res.status(400).json({ success: false, message: 'role, skills, and timeline are required' });
    }
    const roadmap = await generateRoadmapFromForm({ role, skills, experience, timeline });
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('roadmapFromForm error:', error);
    res.status(500).json({ success: false, message: error.message || 'Roadmap generation failed' });
  }
};

// @desc    Generate roadmap from resume PDF
// @route   POST /api/resume/roadmap-resume
const roadmapFromResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF' });

    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF.' });
    }

    const roadmap = await generateRoadmapFromResume(rawText);
    res.json({ success: true, roadmap });
  } catch (error) {
    console.error('roadmapFromResume error:', error);
    res.status(500).json({ success: false, message: error.message || 'Roadmap generation failed' });
  }
};

// @desc    Generate interview questions from form
// @route   POST /api/resume/interview
const interviewFromForm = async (req, res) => {
  try {
    const { role, level, skills, company } = req.body;
    if (!role || !skills) {
      return res.status(400).json({ success: false, message: 'role and skills are required' });
    }
    const interview = await generateInterviewFromForm({ role, level, skills, company });
    res.json({ success: true, interview });
  } catch (error) {
    console.error('interviewFromForm error:', error);
    res.status(500).json({ success: false, message: error.message || 'Interview generation failed' });
  }
};

// @desc    Generate interview questions from resume PDF
// @route   POST /api/resume/interview-resume
const interviewFromResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF' });

    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim().length < 50) {
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF.' });
    }

    const interview = await generateInterviewFromResume(rawText);
    res.json({ success: true, interview });
  } catch (error) {
    console.error('interviewFromResume error:', error);
    res.status(500).json({ success: false, message: error.message || 'Interview generation failed' });
  }
};

module.exports = {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  roadmapFromForm,
  roadmapFromResume,
  interviewFromForm,
  interviewFromResume,
};