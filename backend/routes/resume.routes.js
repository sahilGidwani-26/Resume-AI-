const express = require('express');
const router = express.Router();
const {
  uploadResume, getResumes, getResumeById, deleteResume,
  roadmapFromForm, roadmapFromResume,
  interviewFromForm, interviewFromResume,
  mockInterviewFromForm, mockInterviewFromResume,
  evaluateSingleAnswer, finalInterviewReport,
  saveInterviewSession, getInterviewSessions, getInterviewSessionById,
} = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

// ─── Mock interview routes ────────────────────────────────────────────────────
router.post('/mock-interview', mockInterviewFromForm);
router.post('/mock-interview-resume', upload.single('resume'), mockInterviewFromResume);
router.post('/evaluate-answer', evaluateSingleAnswer);
router.post('/final-report', finalInterviewReport);

// ─── Interview session history (DB) ──────────────────────────────────────────
router.post('/interview-sessions', saveInterviewSession);
router.get('/interview-sessions', getInterviewSessions);
router.get('/interview-sessions/:id', getInterviewSessionById);

// ─── Roadmap routes ───────────────────────────────────────────────────────────
router.post('/roadmap', roadmapFromForm);
router.post('/roadmap-resume', upload.single('resume'), roadmapFromResume);

// ─── Interview prep routes ────────────────────────────────────────────────────
router.post('/interview', interviewFromForm);
router.post('/interview-resume', upload.single('resume'), interviewFromResume);

// ─── General resume routes (/:id must be LAST) ────────────────────────────────
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

module.exports = router;