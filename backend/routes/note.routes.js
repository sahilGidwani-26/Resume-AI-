const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth.middleware');

const {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  updateStatus,
  getStats,
  bulkDelete,
} = require('../controllers/note.controller');

router.use(protect);

// Specific routes first
router.get('/stats', getStats);
router.delete('/bulk', bulkDelete);

// General routes
router.get('/', getNotes);
router.get('/:id', getNoteById);

router.post('/', createNote);

router.put('/:id', updateNote);

router.patch('/:id/status', updateStatus);

router.delete('/:id', deleteNote);

module.exports = router;