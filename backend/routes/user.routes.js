const express = require('express');
const router = express.Router();
const { getDashboard, updateProfile, saveResumeBuilder, getResumeBuilder, getAllBuiltResumes } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/dashboard', getDashboard);
router.put('/profile', updateProfile);
router.post('/resume-builder', saveResumeBuilder);
router.get('/resume-builder', getAllBuiltResumes);
router.get('/resume-builder/:id', getResumeBuilder);

module.exports = router;