const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['note', 'task', 'schedule'],
    default: 'note',
  },

  // ── Common fields ──
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true, default: '' },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  color: {
    type: String,
    default: 'blue',
  },
  tags: [{ type: String, trim: true }],

  // ── Task fields ──
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'done'],
    default: 'pending',
  },
  dueDate: { type: Date },

  // ── Schedule / Timetable fields ──
  scheduleDate: { type: Date },        // which day
  startTime: { type: String },         // "09:00"
  endTime: { type: String },           // "10:30"
  repeat: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'weekdays', 'weekends'],
    default: 'none',
  },
  category: {
    type: String,
    enum: ['study', 'interview', 'exercise', 'work', 'personal', 'other'],
    default: 'other',
  },
  reminderMinutes: { type: Number, default: 0 }, // minutes before

  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

noteSchema.index({ user: 1, type: 1, createdAt: -1 });
noteSchema.index({ user: 1, scheduleDate: 1 });

module.exports = mongoose.model('Note', noteSchema);