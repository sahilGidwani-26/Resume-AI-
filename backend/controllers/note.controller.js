const Note = require('../models/Note.model');

/* ── helpers ── */
const err = (res, status, msg) => res.status(status).json({ success: false, message: msg });
const ok  = (res, data, msg = 'Success') => res.json({ success: true, message: msg, data });

/* ────────────────────────────────────────────
   GET /api/notes
   Query: type, status, priority, category, date (YYYY-MM-DD), archived
──────────────────────────────────────────── */
const getNotes = async (req, res) => {
  try {
    const { type, status, priority, category, date, archived = false, page = 1, limit = 50 } = req.query;

    const filter = {
      user: req.user._id,
      isArchived: archived === 'true',
    };

    if (type)     filter.type     = type;
    if (status)   filter.status   = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // filter by scheduleDate (for timetable view)
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.scheduleDate = { $gte: start, $lte: end };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    return ok(res, { notes, total, page: Number(page), totalPages: Math.ceil(total / limit) });
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   GET /api/notes/:id
──────────────────────────────────────────── */
const getNoteById = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return err(res, 404, 'Note not found');
    return ok(res, note);
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   POST /api/notes
──────────────────────────────────────────── */
 const createNote = async (req, res) => {
  try {
    const {
      type, title, description, priority, color, tags,
      status, dueDate,
      scheduleDate, startTime, endTime, repeat, category, reminderMinutes,
      isPinned,
    } = req.body;

    if (!title?.trim()) return err(res, 400, 'Title is required');

    const note = await Note.create({
      user: req.user._id,
      type: type || 'note',
      title: title.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      color: color || 'blue',
      tags: tags || [],
      status: status || 'pending',
      dueDate:       dueDate       ? new Date(dueDate)       : undefined,
      scheduleDate:  scheduleDate  ? new Date(scheduleDate)  : undefined,
      startTime, endTime,
      repeat:        repeat        || 'none',
      category:      category      || 'other',
      reminderMinutes: reminderMinutes || 0,
      isPinned: isPinned || false,
    });

    return ok(res, note, 'Created successfully');
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   PUT /api/notes/:id
──────────────────────────────────────────── */
const updateNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!note) return err(res, 404, 'Note not found');

    const allowed = [
      'title','description','priority','color','tags',
      'status','dueDate',
      'scheduleDate','startTime','endTime','repeat','category','reminderMinutes',
      'isPinned','isArchived',
    ];

    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'dueDate' || field === 'scheduleDate') {
          note[field] = req.body[field] ? new Date(req.body[field]) : undefined;
        } else {
          note[field] = req.body[field];
        }
      }
    });

    await note.save();
    return ok(res, note, 'Updated successfully');
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   DELETE /api/notes/:id
──────────────────────────────────────────── */
const deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!note) return err(res, 404, 'Note not found');
    return ok(res, null, 'Deleted successfully');
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   PATCH /api/notes/:id/status   { status }
──────────────────────────────────────────── */
const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending','in_progress','done'].includes(status))
      return err(res, 400, 'Invalid status');

    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { status },
      { new: true }
    );
    if (!note) return err(res, 404, 'Note not found');
    return ok(res, note, 'Status updated');
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   GET /api/notes/stats
──────────────────────────────────────────── */
const getStats = async (req, res) => {
  try {
    const uid = req.user._id;
    const [notes, tasks, schedules, done, pending, inProgress] = await Promise.all([
      Note.countDocuments({ user: uid, type: 'note',     isArchived: false }),
      Note.countDocuments({ user: uid, type: 'task',     isArchived: false }),
      Note.countDocuments({ user: uid, type: 'schedule', isArchived: false }),
      Note.countDocuments({ user: uid, status: 'done',        isArchived: false }),
      Note.countDocuments({ user: uid, status: 'pending',     isArchived: false }),
      Note.countDocuments({ user: uid, status: 'in_progress', isArchived: false }),
    ]);
    return ok(res, { notes, tasks, schedules, done, pending, inProgress, total: notes + tasks + schedules });
  } catch (e) {
    return err(res, 500, e.message);
  }
};

/* ────────────────────────────────────────────
   DELETE /api/notes/bulk   { ids: [] }
──────────────────────────────────────────── */
const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) return err(res, 400, 'No ids provided');
    await Note.deleteMany({ _id: { $in: ids }, user: req.user._id });
    return ok(res, null, `${ids.length} items deleted`);
  } catch (e) {
    return err(res, 500, e.message);
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  updateStatus,
  getStats,
  bulkDelete,
};