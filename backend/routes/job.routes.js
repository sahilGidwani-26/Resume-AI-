const express = require('express');
const router = express.Router();
const { getJobRecommendations, searchJobs } = require('../controllers/job.controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/recommendations', getJobRecommendations);
router.post('/search', searchJobs);

module.exports = router;