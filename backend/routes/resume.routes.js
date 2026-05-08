const express = require('express');
const router = express.Router();
const {
  uploadResume, getResumes, getResumeById, deleteResume,
  roadmapFromForm, roadmapFromResume,
  interviewFromForm, interviewFromResume,
  mockInterviewFromForm, mockInterviewFromResume,
  evaluateSingleAnswer, finalInterviewReport,
} = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

// Specific routes FIRST (before /:id)
router.post('/roadmap', roadmapFromForm);
router.post('/roadmap-resume', upload.single('resume'), roadmapFromResume);
router.post('/interview', interviewFromForm);
router.post('/interview-resume', upload.single('resume'), interviewFromResume);
router.post('/mock-interview', mockInterviewFromForm);
router.post('/mock-interview-resume', upload.single('resume'), mockInterviewFromResume);
router.post('/evaluate-answer', evaluateSingleAnswer);
router.post('/final-report', finalInterviewReport);

// General resume routes
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

module.exports = router;