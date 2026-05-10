const express = require('express');
const router = express.Router();
const {
  createPortfolioFromForm,
  createPortfolioFromResume,
  getUserPortfolios,
  getPortfolioBySlug,
  getPortfolioById,
  analyzeUserPortfolio,
  updatePortfolio,
  deletePortfolio,
  getPortfolioStats,
    analyzePublicUrl,
} = require('../controllers/portfolio.controller');
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// ── Public route (no auth needed — for sharing) ───────────────────────────────
router.get('/view/:slug', getPortfolioBySlug);

// ── All routes below require auth ─────────────────────────────────────────────
router.use(protect);

// Stats (for dashboard widget)
router.get('/stats', getPortfolioStats);
router.post('/analyze-url', analyzePublicUrl); 

// Create
router.post('/from-form',   createPortfolioFromForm);
router.post('/from-resume', upload.single('resume'), createPortfolioFromResume);

// List all user portfolios
router.get('/', getUserPortfolios);

// Analyze specific portfolio
router.post('/:id/analyze', analyzeUserPortfolio);

// CRUD
router.get('/:id',    getPortfolioById);
router.put('/:id',    updatePortfolio);
router.delete('/:id', deletePortfolio);

module.exports = router;