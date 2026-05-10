const pdfParse = require('pdf-parse');
const { nanoid } = require('nanoid');
const Portfolio = require('../models/Portfolio.model');
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const {
  generatePortfolioFromForm,
  generatePortfolioFromResume,
  analyzePortfolio,
} = require('../utils/portfolio.ai');

// ── helper: make a URL-safe slug ──────────────────────────────────────────────
const makeSlug = (name) => {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);
  const suffix = nanoid(6); // e.g. "a3f2Xk"
  return `${base}-${suffix}`;
};

// ─── CREATE PORTFOLIO FROM FORM ───────────────────────────────────────────────
// POST /api/portfolio/from-form
const createPortfolioFromForm = async (req, res) => {
  try {
    const {
      name, title, email, phone, location,
      linkedin, github, website, bio,
      skills, experience, education, projects, certifications,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    // Let AI polish the content
    const aiData = await generatePortfolioFromForm({
      name, title, email, phone, location, linkedin, github, bio,
      skills: typeof skills === 'string' ? skills.split(',').map(s => s.trim()) : skills,
      experience: experience || [],
      education: education || [],
      projects: projects || [],
      certifications: certifications || [],
    });

    const slug = makeSlug(name);

    const portfolio = await Portfolio.create({
      user: req.user._id,
      slug,
      generatedFrom: 'form',
      name: aiData.name || name,
      title: aiData.title || title || '',
      email: aiData.email || email || '',
      phone: aiData.phone || phone || '',
      location: aiData.location || location || '',
      linkedin: aiData.linkedin || linkedin || '',
      github: aiData.github || github || '',
      website: website || '',
      bio: aiData.bio || bio || '',
      skills: aiData.skills || [],
      experience: aiData.experience || [],
      education: aiData.education || [],
      projects: aiData.projects || [],
      certifications: aiData.certifications || [],
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio created successfully',
      portfolio,
      portfolioUrl: `/portfolio/${slug}`,
    });
  } catch (error) {
    console.error('createPortfolioFromForm error:', error);
    res.status(500).json({ success: false, message: error.message || 'Portfolio creation failed' });
  }
};

// ─── CREATE PORTFOLIO FROM RESUME ─────────────────────────────────────────────
// POST /api/portfolio/from-resume
const createPortfolioFromResume = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Please upload a PDF file' });

    const pdfData = await pdfParse(req.file.buffer);
    const rawText = pdfData.text;
    if (!rawText || rawText.trim().length < 50)
      return res.status(400).json({ success: false, message: 'Could not extract text from PDF.' });

    const aiData = await generatePortfolioFromResume(rawText);
    if (!aiData.name) return res.status(400).json({ success: false, message: 'Could not extract name from resume.' });

    const slug = makeSlug(aiData.name);

    const portfolio = await Portfolio.create({
      user: req.user._id,
      slug,
      generatedFrom: 'resume',
      name:           aiData.name || '',
      title:          aiData.title || '',
      email:          aiData.email || '',
      phone:          aiData.phone || '',
      location:       aiData.location || '',
      linkedin:       aiData.linkedin || '',
      github:         aiData.github || '',
      website:        aiData.website || '',
      bio:            aiData.bio || '',
      skills:         aiData.skills || [],
      experience:     aiData.experience || [],
      education:      aiData.education || [],
      projects:       aiData.projects || [],
      certifications: aiData.certifications || [],
    });

    res.status(201).json({
      success: true,
      message: 'Portfolio generated from resume successfully',
      portfolio,
      portfolioUrl: `/portfolio/${slug}`,
    });
  } catch (error) {
    console.error('createPortfolioFromResume error:', error);
    res.status(500).json({ success: false, message: error.message || 'Portfolio generation failed' });
  }
};

// ─── GET ALL USER PORTFOLIOS ──────────────────────────────────────────────────
// GET /api/portfolio
const getUserPortfolios = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .select('name title slug analysisScore analysisReport generatedFrom createdAt views isPublished')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: portfolios.length, portfolios });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE PORTFOLIO BY SLUG (public) ────────────────────────────────────
// GET /api/portfolio/view/:slug
const getPortfolioBySlug = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ slug: req.params.slug, isPublished: true });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    // Increment views
    portfolio.views += 1;
    await portfolio.save();
    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET SINGLE PORTFOLIO BY ID (owner) ──────────────────────────────────────
// GET /api/portfolio/:id
const getPortfolioById = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── ANALYZE PORTFOLIO ────────────────────────────────────────────────────────
// POST /api/portfolio/:id/analyze
const analyzeUserPortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOne({ _id: req.params.id, user: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });

    const report = await analyzePortfolio({
      name:           portfolio.name,
      title:          portfolio.title,
      bio:            portfolio.bio,
      email:          portfolio.email,
      linkedin:       portfolio.linkedin,
      github:         portfolio.github,
      website:        portfolio.website,
      skills:         portfolio.skills,
      experience:     portfolio.experience,
      education:      portfolio.education,
      projects:       portfolio.projects,
      certifications: portfolio.certifications,
    });

    portfolio.analysisScore  = report.score;
    portfolio.analysisReport = report;
    portfolio.lastAnalyzedAt = new Date();
    await portfolio.save();

    res.json({ success: true, report, portfolio });
  } catch (error) {
    console.error('analyzeUserPortfolio error:', error);
    res.status(500).json({ success: false, message: error.message || 'Analysis failed' });
  }
};

// ─── UPDATE PORTFOLIO ─────────────────────────────────────────────────────────
// PUT /api/portfolio/:id
const updatePortfolio = async (req, res) => {
  try {
    const allowed = ['name','title','email','phone','location','linkedin','github','website',
      'bio','skills','experience','education','projects','certifications','isPublished'];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });

    const portfolio = await Portfolio.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      updates,
      { new: true }
    );
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, message: 'Portfolio updated', portfolio });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE PORTFOLIO ─────────────────────────────────────────────────────────
// DELETE /api/portfolio/:id
const deletePortfolio = async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!portfolio) return res.status(404).json({ success: false, message: 'Portfolio not found' });
    res.json({ success: true, message: 'Portfolio deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DASHBOARD STATS ──────────────────────────────────────────────────────────
// GET /api/portfolio/stats
const getPortfolioStats = async (req, res) => {
  try {
    const portfolios = await Portfolio.find({ user: req.user._id })
      .select('analysisScore views createdAt generatedFrom');

    const totalViews   = portfolios.reduce((sum, p) => sum + (p.views || 0), 0);
    const analyzed     = portfolios.filter(p => p.analysisScore !== null);
    const avgScore     = analyzed.length
      ? Math.round(analyzed.reduce((s, p) => s + p.analysisScore, 0) / analyzed.length)
      : null;
    const bestScore    = analyzed.length ? Math.max(...analyzed.map(p => p.analysisScore)) : null;

    res.json({
      success: true,
      stats: {
        total:      portfolios.length,
        totalViews,
        avgScore,
        bestScore,
        analyzed:   analyzed.length,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const analyzePublicUrl = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'URL required',
      });
    }

    let pageText = '';

    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });

      const page = await browser.newPage();

      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 60000,
      });

      // Wait for React content
      await new Promise(resolve => setTimeout(resolve, 3000));

      pageText = await page.evaluate(() => {
        return document.body.innerText;
      });

      await browser.close();

      pageText = pageText
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000);

    } catch (err) {
      console.log('Puppeteer Error:', err);

      return res.status(400).json({
        success: false,
        message: 'Could not fetch or render this URL.',
      });
    }

    if (!pageText || pageText.length < 100) {
      return res.status(400).json({
        success: false,
        message: 'Could not extract content from this page.',
      });
    }

    // AI analysis
    const { analyzePortfolioText } = require('../utils/portfolio.ai');

    const report = await analyzePortfolioText(pageText, url);

    res.json({
      success: true,
      report,
    });

  } catch (error) {
    console.error('analyzePublicUrl error:', error);

    res.status(500).json({
      success: false,
      message: error.message || 'Analysis failed',
    });
  }
};
module.exports = {
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
};