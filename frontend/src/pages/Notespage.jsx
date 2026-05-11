import { useState, useEffect, useCallback } from 'react';
import API from '../utils/api';
import {
  StickyNote, CheckSquare, CalendarDays, Plus, Trash2,
  Clock,  Calendar, CheckCheck, Circle,
  AlarmClock, X, Pencil, Pin, RefreshCcw,
  BookOpen, Briefcase, Dumbbell, User, Folder, MoreHorizontal,
  Search,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

/* ────────────── Constants ────────────── */
 const API_URL = `${process.env.VITE_API_URL}/notes`;

const TYPES = [
  { value: 'note',     label: 'Notes',    icon: StickyNote,   color: 'text-amber-400',  activeBg: 'bg-amber-500/10 border-amber-500/20' },
  { value: 'task',     label: 'Tasks',    icon: CheckSquare,  color: 'text-sky-400',    activeBg: 'bg-sky-500/10 border-sky-500/20' },
  { value: 'schedule', label: 'Schedule', icon: CalendarDays, color: 'text-violet-400', activeBg: 'bg-violet-500/10 border-violet-500/20' },
];

const PRIORITIES = [
  { value: 'high',   label: 'High',   badge: 'bg-red-500/10 border-red-500/25 text-red-400' },
  { value: 'medium', label: 'Medium', badge: 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400' },
  { value: 'low',    label: 'Low',    badge: 'bg-green-500/10 border-green-500/25 text-green-400' },
];

const STATUSES = [
  { value: 'pending',     label: 'Pending',     badge: 'bg-slate-500/10 border-slate-500/25 text-slate-400' },
  { value: 'in_progress', label: 'In Progress', badge: 'bg-blue-500/10 border-blue-500/25 text-blue-400' },
  { value: 'done',        label: 'Done',        badge: 'bg-green-500/10 border-green-500/25 text-green-400' },
];

const CATEGORIES = [
  { value: 'study',     label: 'Study',     Icon: BookOpen },
  { value: 'interview', label: 'Interview', Icon: Briefcase },
  { value: 'exercise',  label: 'Exercise',  Icon: Dumbbell },
  { value: 'work',      label: 'Work',      Icon: Folder },
  { value: 'personal',  label: 'Personal',  Icon: User },
  { value: 'other',     label: 'Other',     Icon: MoreHorizontal },
];

const REPEATS    = ['none','daily','weekly','weekdays','weekends'];
const COLORS     = ['blue','violet','amber','green','red','pink','teal'];
const COLOR_DOTS = { blue:'#3b82f6', violet:'#8b5cf6', amber:'#f59e0b', green:'#22c55e', red:'#ef4444', pink:'#ec4899', teal:'#14b8a6' };
const COLOR_LEFT = { blue:'border-l-blue-500', violet:'border-l-violet-500', amber:'border-l-amber-500', green:'border-l-green-500', red:'border-l-red-500', pink:'border-l-pink-500', teal:'border-l-teal-500' };
const TIMES = Array.from({ length: 34 }, (_, i) => {
  const h = Math.floor(i / 2) + 6;
  const m = i % 2 === 0 ? '00' : '30';
  if (h > 22) return null;
  return `${String(h).padStart(2,'0')}:${m}`;
}).filter(Boolean);

/* ── tiny finders ── */
const getPri  = v => PRIORITIES.find(p => p.value === v) || PRIORITIES[1];
const getStat = v => STATUSES.find(s => s.value === v)   || STATUSES[0];
const getCat  = v => CATEGORIES.find(c => c.value === v);
const getTyp  = v => TYPES.find(t => t.value === v);
const fmtDate = d => d ? new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) : '';

/* ────────────── API calls ────────────── */
const apiFn = {
  list:   p      => API.get(API_URL, { params: p }),
  stats:  ()     => API.get(`${API_URL}/stats`),
  create: body   => API.post(API_URL, body),
  update: (id,b) => API.put(`${API_URL}/${id}`, b),
  status: (id,s) => API.patch(`${API_URL}/${id}/status`, { status: s }),
  remove: id     => API.delete(`${API_URL}/${id}`),
};


function NoteFormModal({ onClose, onSave, initial, defaultType }) {
  const editing = !!initial;
  const [f, setF] = useState({
    type:            initial?.type            || defaultType || 'note',
    title:           initial?.title           || '',
    description:     initial?.description     || '',
    priority:        initial?.priority        || 'medium',
    color:           initial?.color           || 'blue',
    tags:            initial?.tags?.join(', ')|| '',
    status:          initial?.status          || 'pending',
    dueDate:         initial?.dueDate         ? new Date(initial.dueDate).toISOString().slice(0,10)      : '',
    scheduleDate:    initial?.scheduleDate    ? new Date(initial.scheduleDate).toISOString().slice(0,10) : '',
    startTime:       initial?.startTime       || '',
    endTime:         initial?.endTime         || '',
    repeat:          initial?.repeat          || 'none',
    category:        initial?.category        || 'other',
    reminderMinutes: initial?.reminderMinutes || 0,
    isPinned:        initial?.isPinned        || false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setF(prev => ({ ...prev, [k]: v }));

  const handleSave = async () => {
    if (!f.title.trim()) { toast.error('Title is required'); return; }
    setSaving(true);
    try {
      await onSave({ ...f, tags: f.tags.split(',').map(t => t.trim()).filter(Boolean) });
      onClose();
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  const T = getTyp(f.type);
  const TIcon = T?.icon || StickyNote;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-[#0d1424] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${T?.activeBg}`}>
              <TIcon size={15} className={T?.color} />
            </div>
            <span className="text-sm font-semibold text-white">{editing ? 'Edit' : 'New'} {T?.label.slice(0,-1)}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] text-slate-500 hover:text-white flex items-center justify-center transition-all">
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">

          {/* Type tabs (only when creating) */}
          {!editing && (
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map(({ value, label, icon: Icon, color, activeBg }) => (
                <button key={value} onClick={() => set('type', value)}
                  className={`flex items-center justify-center gap-2 py-2 rounded-xl border text-xs font-medium transition-all
                    ${f.type === value ? activeBg + ' ' + color : 'border-white/[0.07] text-slate-600 hover:text-slate-300 hover:border-white/10'}`}>
                  <Icon size={14} /> {label.slice(0,-1)}
                </button>
              ))}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Title *</label>
            <input
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-sky-500/50 transition-colors"
              placeholder={f.type === 'note' ? 'What do you want to note?' : f.type === 'task' ? 'What needs to be done?' : 'Schedule title…'}
              value={f.title}
              onChange={e => set('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Description</label>
            <textarea
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-sky-500/50 transition-colors resize-none"
              rows={3}
              placeholder="Add details, context, or notes…"
              value={f.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>

          {/* Priority + Status + Color */}
          <div className={`grid gap-3 ${f.type === 'task' ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Priority</label>
              <select className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50"
                value={f.priority} onChange={e => set('priority', e.target.value)}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            {f.type === 'task' && (
              <div>
                <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Status</label>
                <select className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50"
                  value={f.status} onChange={e => set('status', e.target.value)}>
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Color</label>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                {COLORS.map(c => (
                  <button key={c} onClick={() => set('color', c)}
                    style={{ background: COLOR_DOTS[c], borderColor: f.color === c ? '#fff' : 'transparent' }}
                    className="w-6 h-6 rounded-full border-2 transition-all" />
                ))}
              </div>
            </div>
          </div>

          {/* Task: due date */}
          {f.type === 'task' && (
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Due Date</label>
              <input type="date" className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50 [color-scheme:dark]"
                value={f.dueDate} onChange={e => set('dueDate', e.target.value)} />
            </div>
          )}

          {/* Schedule fields */}
          {f.type === 'schedule' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Date</label>
                  <input type="date" className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50 [color-scheme:dark]"
                    value={f.scheduleDate} onChange={e => set('scheduleDate', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Category</label>
                  <select className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50"
                    value={f.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {['startTime','endTime'].map(k => (
                  <div key={k}>
                    <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">{k === 'startTime' ? 'Start Time' : 'End Time'}</label>
                    <select className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50"
                      value={f[k]} onChange={e => set(k, e.target.value)}>
                      <option value="">Select</option>
                      {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Repeat</label>
                  <select className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50 capitalize"
                    value={f.repeat} onChange={e => set('repeat', e.target.value)}>
                    {REPEATS.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Reminder (min before)</label>
                  <input type="number" min={0} max={120} step={5}
                    className="w-full bg-[#111827] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-300 outline-none focus:border-sky-500/50"
                    value={f.reminderMinutes} onChange={e => set('reminderMinutes', +e.target.value)} />
                </div>
              </div>
            </>
          )}

          {/* Tags + Pin */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold tracking-widest uppercase text-slate-600 mb-1.5">Tags</label>
              <input className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-700 outline-none focus:border-sky-500/50 transition-colors"
                placeholder="react, dsa, job…" value={f.tags} onChange={e => set('tags', e.target.value)} />
            </div>
            <div className="flex flex-col justify-end">
              <button onClick={() => set('isPinned', !f.isPinned)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                  ${f.isPinned ? 'bg-amber-500/10 border-amber-500/25 text-amber-400' : 'border-white/[0.07] text-slate-500 hover:text-slate-300'}`}>
                <Pin size={13} /> {f.isPinned ? 'Pinned ✓' : 'Pin this item'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-white/[0.07]">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white bg-white/[0.03] border border-white/[0.07] transition-all">Cancel</button>
          <button onClick={handleSave} disabled={saving}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-60 text-white text-sm font-semibold transition-all flex items-center gap-2">
            {saving ? <RefreshCcw size={14} className="animate-spin" /> : <Plus size={14} />}
            {editing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   NOTE CARD
═══════════════════════════════════════ */
function NoteCard({ note, onEdit, onDelete, onStatusChange }) {
  const p  = getPri(note.priority);
  const s  = getStat(note.status);
  const T  = getTyp(note.type);
  const c  = getCat(note.category);
  const TIcon = T?.icon || StickyNote;
  const CIcon = c?.Icon;
  const cl = COLOR_LEFT[note.color] || 'border-l-blue-500';

  const cycleStatus = () => {
    const nx = { pending: 'in_progress', in_progress: 'done', done: 'pending' };
    onStatusChange(note._id, nx[note.status] || 'pending');
  };

  return (
    <div className={`group relative bg-white/[0.025] border border-white/[0.07] hover:border-white/[0.13] rounded-xl p-4 border-l-[3px] ${cl} transition-all duration-150`}>
      {note.isPinned && <Pin size={10} className="absolute top-2.5 right-2.5 text-amber-400/60" />}

      <div className="flex items-start gap-3">
        {/* Status toggle for tasks */}
        {note.type === 'task' ? (
          <button onClick={cycleStatus} className="mt-0.5 shrink-0" title="Click to change status">
            {note.status === 'done'        ? <CheckSquare size={16} className="text-green-400" />
           : note.status === 'in_progress' ? <Circle size={16} className="text-blue-400" />
           : <Circle size={16} className="text-slate-600 hover:text-slate-400 transition-colors" />}
          </button>
        ) : (
          <TIcon size={14} className={`mt-0.5 shrink-0 ${T?.color}`} />
        )}

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${note.status === 'done' ? 'line-through text-slate-500' : 'text-slate-100'}`}>
            {note.title}
          </p>
          {note.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{note.description}</p>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${p.badge}`}>{p.label}</span>
            {note.type === 'task' && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${s.badge}`}>{s.label}</span>
            )}
            {note.startTime && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Clock size={9} /> {note.startTime}{note.endTime ? ` – ${note.endTime}` : ''}
              </span>
            )}
            {note.dueDate && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <Calendar size={9} /> {fmtDate(note.dueDate)}
              </span>
            )}
            {note.scheduleDate && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <CalendarDays size={9} /> {fmtDate(note.scheduleDate)}
              </span>
            )}
            {c && note.type === 'schedule' && CIcon && (
              <span className="flex items-center gap-1 text-[10px] text-slate-500">
                <CIcon size={9} /> {c.label}
              </span>
            )}
            {note.repeat && note.repeat !== 'none' && (
              <span className="text-[10px] text-slate-500 capitalize">{note.repeat}</span>
            )}
            {note.tags?.map(tag => (
              <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-500">#{tag}</span>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button onClick={() => onEdit(note)}
            className="w-7 h-7 rounded-lg hover:bg-white/[0.08] text-slate-600 hover:text-sky-400 flex items-center justify-center transition-all">
            <Pencil size={12} />
          </button>
          <button onClick={() => onDelete(note._id)}
            className="w-7 h-7 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 flex items-center justify-center transition-all">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════
   TIMETABLE VIEW
═══════════════════════════════════════ */
function TimetableView({ notes, onEdit, onDelete, onStatusChange, selectedDate, onDateChange }) {
  const schedules = notes.filter(n => n.type === 'schedule');
  const byTime = {};
  schedules.forEach(n => {
    const key = n.startTime || '??:??';
    if (!byTime[key]) byTime[key] = [];
    byTime[key].push(n);
  });
  const sortedSlots = Object.keys(byTime).sort();

  return (
    <div className="space-y-4">
      {/* Date selector */}
      <div className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
        <CalendarDays size={15} className="text-violet-400 shrink-0" />
        <span className="text-xs text-slate-500">Date:</span>
        <input type="date"
          className="bg-transparent text-sm text-slate-200 outline-none [color-scheme:dark] flex-1 cursor-pointer"
          value={selectedDate}
          onChange={e => onDateChange(e.target.value)} />
      </div>

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-700">
          <AlarmClock size={48} className="mb-4 opacity-20" />
          <p className="text-sm font-medium">No schedule for this date</p>
          <p className="text-xs mt-1 opacity-50">Add a schedule entry and select a date & time</p>
        </div>
      ) : (
        <div className="relative pl-2">
          {/* Vertical timeline */}
          <div className="absolute left-[60px] top-0 bottom-0 w-px bg-white/[0.05]" />

          {sortedSlots.map(time => (
            <div key={time} className="flex gap-0 mb-5">
              <div className="w-14 shrink-0 text-right pr-3 pt-2">
                <span className="text-[11px] font-mono text-slate-600">{time}</span>
              </div>
              <div className="w-3 shrink-0 flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500 ring-4 ring-violet-500/10 mt-2 z-10 relative" />
              </div>
              <div className="flex-1 pl-3 space-y-2">
                {byTime[time].map(n => (
                  <NoteCard key={n._id} note={n} onEdit={onEdit} onDelete={onDelete} onStatusChange={onStatusChange} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════
   STATS BAR
═══════════════════════════════════════ */
function StatsBar({ stats, loading }) {
  const rows = [
    { label: 'Notes',     value: stats?.notes    ?? 0, Icon: StickyNote,   color: 'text-amber-400'  },
    { label: 'Tasks',     value: stats?.tasks     ?? 0, Icon: CheckSquare,  color: 'text-sky-400'    },
    { label: 'Schedules', value: stats?.schedules ?? 0, Icon: CalendarDays, color: 'text-violet-400' },
    { label: 'Done',      value: stats?.done      ?? 0, Icon: CheckCheck,   color: 'text-green-400'  },
    { label: 'Pending',   value: stats?.pending   ?? 0, Icon: Clock,        color: 'text-yellow-400' },
  ];
  return (
    <div className="grid grid-cols-5 gap-3">
      {rows.map(({ label, value, Icon, color }) => (
        <div key={label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 space-y-1.5">
          <Icon size={14} className={color} />
          <p className={`text-xl font-bold ${loading ? 'text-slate-700 animate-pulse' : 'text-white'}`}>{value}</p>
          <p className="text-[10px] text-slate-600">{label}</p>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
export default function NotesPage() {
  const [activeType,    setActiveType]    = useState('note');
  const [notes,         setNotes]         = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(false);
  const [statsLoading,  setStatsLoading]  = useState(false);
  const [showModal,     setShowModal]     = useState(false);
  const [editNote,      setEditNote]      = useState(null);
  const [search,        setSearch]        = useState('');
  const [filterPri,     setFilterPri]     = useState('all');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [selectedDate,  setSelectedDate]  = useState(new Date().toISOString().slice(0,10));

  /* ── fetch ── */
  const fetchNotes = useCallback(async () => {
    setLoading(true);
    try {
      const params = { type: activeType };
      if (activeType === 'schedule') params.date = selectedDate;
      if (filterPri    !== 'all') params.priority = filterPri;
      if (filterStatus !== 'all') params.status   = filterStatus;
      const { data } = await apiFn.list(params);
      setNotes(data.data.notes);
    } catch { toast.error('Could not load data'); }
    finally  { setLoading(false); }
  }, [activeType, selectedDate, filterPri, filterStatus]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try { const { data } = await apiFn.stats(); setStats(data.data); } catch {}
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  /* ── handlers ── */
  const handleSave = async body => {
    if (editNote) {
      await apiFn.update(editNote._id, body);
      toast.success('Updated!');
    } else {
      await apiFn.create(body);
      toast.success('Saved!');
    }
    setEditNote(null);
    fetchNotes(); fetchStats();
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this item?')) return;
    await apiFn.remove(id);
    toast.success('Deleted');
    setNotes(n => n.filter(x => x._id !== id));
    fetchStats();
  };

  const handleStatusChange = async (id, status) => {
    await apiFn.status(id, status);
    setNotes(n => n.map(x => x._id === id ? { ...x, status } : x));
    fetchStats();
  };

  const openEdit = note => { setEditNote(note); setShowModal(true); };
  const openNew  = ()   => { setEditNote(null); setShowModal(true); };

  /* ── filtered list ── */
  const filtered = notes.filter(n =>
    !search ||
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    (n.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const T = getTyp(activeType);
  const TIcon = T?.icon || StickyNote;

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100">

      {/* ── Top bar (like Resume Builder) ── */}
      <div className="border-b border-white/[0.06] px-6 py-4 flex items-center justify-between sticky top-0 bg-[#080d1a]/90 backdrop-blur-sm z-10">
        <div>
          <h1 className="text-lg font-bold text-white flex items-center gap-2">
            <StickyNote size={18} className="text-sky-400" /> Notes & Todos
          </h1>
          <p className="text-[11px] text-slate-500 mt-0.5">Manage notes, tasks, and daily schedule — saved to your account</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold transition-all shadow-lg shadow-sky-500/20">
          <Plus size={15} /> New {T?.label.slice(0,-1)}
        </button>
      </div>

      <div className="px-6 py-6 space-y-6 max-w-5xl">

        {/* Stats */}
        <StatsBar stats={stats} loading={statsLoading} />

        {/* Type tabs */}
        <div className="flex items-center gap-1 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
          {TYPES.map(({ value, label, icon: Icon, color, activeBg }) => (
            <button key={value}
              onClick={() => { setActiveType(value); setFilterPri('all'); setFilterStatus('all'); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeType === value ? activeBg + ' ' + color : 'text-slate-500 hover:text-slate-300'}`}>
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex-1 min-w-[180px] flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2">
            <Search size={13} className="text-slate-600 shrink-0" />
            <input
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-700 outline-none"
              placeholder="Search…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && <button onClick={() => setSearch('')}><X size={12} className="text-slate-600 hover:text-slate-400" /></button>}
          </div>
          <select
            className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-400 outline-none"
            value={filterPri} onChange={e => setFilterPri(e.target.value)}>
            <option value="all">All Priorities</option>
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
          {activeType === 'task' && (
            <select
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-slate-400 outline-none"
              value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          )}
          <button onClick={fetchNotes}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-600 hover:text-slate-300 flex items-center justify-center transition-all">
            <RefreshCcw size={13} />
          </button>
        </div>

        {/* Content area */}
        {activeType === 'schedule' ? (
          <TimetableView
            notes={filtered}
            onEdit={openEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
          />
        ) : (
          <div className="space-y-2">
            {loading && [1,2,3].map(i => (
              <div key={i} className="h-[72px] bg-white/[0.025] border border-white/[0.05] rounded-xl animate-pulse" />
            ))}
            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-700">
                <TIcon size={48} className="mb-4 opacity-20" />
                <p className="text-sm">No {T?.label.toLowerCase()} yet</p>
                <p className="text-xs mt-1 opacity-50">Click "New {T?.label.slice(0,-1)}" to add one</p>
              </div>
            )}
            {!loading && filtered.map(note => (
              <NoteCard key={note._id} note={note} onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <NoteFormModal
          onClose={() => { setShowModal(false); setEditNote(null); }}
          onSave={handleSave}
          initial={editNote}
          defaultType={activeType}
        />
      )}
    </div>
  );
}