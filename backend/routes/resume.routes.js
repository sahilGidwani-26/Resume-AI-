const express = require('express');
const router = express.Router();
const {
  uploadResume,
  getResumes,
  getResumeById,
  deleteResume,
  roadmapFromForm,
  roadmapFromResume,
  interviewFromForm,
  interviewFromResume,
} = require('../controllers/resume.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.use(protect);

// Existing routes
router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

// Roadmap routes
router.post('/roadmap', roadmapFromForm);
router.post('/roadmap-resume', upload.single('resume'), roadmapFromResume);

// Interview routes
router.post('/interview', interviewFromForm);
router.post('/interview-resume', upload.single('resume'), interviewFromResume);

module.exports = router;