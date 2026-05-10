import { useState, useEffect } from 'react';
import { userAPI } from '../utils/api';
import toast from 'react-hot-toast';
import {
  User, Briefcase, GraduationCap, Zap, Rocket, Award,
  FolderOpen, Eye, EyeOff, Download, Save, Plus, Trash2,
  Lightbulb, CheckCircle2,  X, FileText, Loader2,
  Inbox, ArrowRight
} from 'lucide-react';

const EMPTY_FORM = {
  title: 'My Resume',
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '', summary: '' },
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  template: 'modern',
};

// ─── Reusable input ───────────────────────────────────
const InputGroup = ({ label, value, onChange, placeholder, type = 'text', rows }) => (
  <div>
    <label className="block text-xs text-slate-500 mb-1">{label}</label>
    {rows ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows} className="input-field resize-none text-sm" />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="input-field text-sm" />
    )}
  </div>
);

const Section = ({ title, children, onAdd, addLabel }) => (
  <div className="card mb-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {onAdd && (
        <button onClick={onAdd} className="flex items-center gap-1.5 text-sm text-sky-400 hover:text-sky-300 border border-sky-500/30 px-3 py-1.5 rounded-lg hover:bg-sky-500/10 transition-all">
          <Plus size={13} /> {addLabel}
        </button>
      )}
    </div>
    {children}
  </div>
);

// ─── Resume Preview HTML ──────────────────────────────
const ResumePreview = ({ data }) => {
  const { personalInfo: pi, experience, education, skills, projects, certifications } = data;
  return (
    <div id="resume-preview" style={{ fontFamily: "'Segoe UI', Arial, system-ui, sans-serif", fontSize: '11px', lineHeight: '1.55', color: '#1e293b', background: '#ffffff', padding: '36px 40px', minHeight: '842px', width: '100%', maxWidth: '794px', margin: '0 auto' }}>
      <div style={{ borderBottom: '2.5px solid #0ea5e9', paddingBottom: '14px', marginBottom: '18px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a', letterSpacing: '-0.5px' }}>{pi.fullName || 'Your Name'}</h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '7px', color: '#475569', fontSize: '10.5px' }}>
          {pi.email    && <span>✉ {pi.email}</span>}
          {pi.phone    && <span>📞 {pi.phone}</span>}
          {pi.location && <span>📍 {pi.location}</span>}
          {pi.linkedin && <span>🔗 {pi.linkedin}</span>}
          {pi.github   && <span>⌥ {pi.github}</span>}
          {pi.website  && <span>🌐 {pi.website}</span>}
        </div>
        {pi.summary && <p style={{ marginTop: '10px', color: '#374151', lineHeight: '1.65', fontSize: '10.5px' }}>{pi.summary}</p>}
      </div>
      {skills?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={sectionHead}>Skills</h2>
          <p style={{ color: '#374151', marginTop: '5px' }}>{skills.join(' · ')}</p>
        </div>
      )}
      {experience?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={sectionHead}>Work Experience</h2>
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: '11px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '11.5px' }}>{exp.role}{exp.company ? ` — ${exp.company}` : ''}</span>
                <span style={{ color: '#64748b', fontSize: '10px', whiteSpace: 'nowrap', marginLeft: '10px' }}>{exp.startDate}{exp.startDate ? ' – ' : ''}{exp.current ? 'Present' : exp.endDate}</span>
              </div>
              {exp.description && <p style={{ color: '#475569', marginTop: '3px', whiteSpace: 'pre-line' }}>{exp.description}</p>}
            </div>
          ))}
        </div>
      )}
      {education?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={sectionHead}>Education</h2>
          {education.map((edu, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '11.5px' }}>{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</span>
                <span style={{ color: '#64748b', fontSize: '10px' }}>{edu.startDate}{edu.startDate ? ' – ' : ''}{edu.endDate}</span>
              </div>
              <p style={{ color: '#475569' }}>{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
            </div>
          ))}
        </div>
      )}
      {projects?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={sectionHead}>Projects</h2>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: '9px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontWeight: 600, color: '#0f172a', fontSize: '11.5px' }}>{p.name}</span>
                {p.link && <span style={{ color: '#0ea5e9', fontSize: '10px' }}>{p.link}</span>}
              </div>
              {p.techStack && <p style={{ color: '#64748b', fontSize: '10px', marginTop: '1px' }}>{p.techStack}</p>}
              {p.description && <p style={{ color: '#475569', marginTop: '2px' }}>{p.description}</p>}
            </div>
          ))}
        </div>
      )}
      {certifications?.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <h2 style={sectionHead}>Certifications</h2>
          {certifications.map((c, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.name}</span>
              <span style={{ color: '#64748b', fontSize: '10px' }}>{c.issuer}{c.date ? ` · ${c.date}` : ''}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const sectionHead = { fontSize: '10.5px', fontWeight: 700, color: '#0ea5e9', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '3px' };

// ─── Saved Resumes Drawer ─────────────────────────────
const SavedResumesDrawer = ({ isOpen, onClose, savedList, onLoad, onDelete, currentId }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-sm bg-slate-900 border-l border-white/10 h-full flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div>
            <h2 className="text-lg font-semibold text-white">Saved Resumes</h2>
            <p className="text-xs text-slate-500 mt-0.5">{savedList.length} resume{savedList.length !== 1 ? 's' : ''} in your account</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {savedList.length === 0 ? (
            <div className="text-center py-16 text-slate-600">
              <Inbox size={40} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">No saved resumes yet</p>
              <p className="text-xs mt-1">Save your resume to see it here</p>
            </div>
          ) : (
            savedList.map((r) => (
              <div key={r._id} onClick={() => { onLoad(r); onClose(); }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${currentId === r._id ? 'border-sky-500/50 bg-sky-500/10' : 'border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-white font-medium text-sm truncate">{r.title || 'Untitled Resume'}</p>
                      {currentId === r._id && (
                        <span className="text-xs text-sky-400 bg-sky-500/15 px-2 py-0.5 rounded-full border border-sky-500/20 flex-shrink-0">Active</span>
                      )}
                    </div>
                    {r.personalInfo?.fullName && <p className="text-slate-400 text-xs">{r.personalInfo.fullName}</p>}
                    <p className="text-slate-600 text-xs mt-1">Saved {new Date(r.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    <div className="flex gap-3 mt-2">
                      {r.experience?.length > 0 && <span className="text-xs text-slate-600 flex items-center gap-1"><Briefcase size={10} /> {r.experience.length} exp</span>}
                      {r.skills?.length > 0      && <span className="text-xs text-slate-600 flex items-center gap-1"><Zap size={10} /> {r.skills.length} skills</span>}
                      {r.projects?.length > 0    && <span className="text-xs text-slate-600 flex items-center gap-1"><Rocket size={10} /> {r.projects.length} proj</span>}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(r._id); }}
                    className="text-slate-600 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => { onLoad(null); onClose(); }} className="w-full btn-secondary text-sm py-2.5 flex items-center justify-center gap-2">
            <Plus size={14} /> Create New Resume
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────
export default function ResumeBuilderPage() {
  const [form, setForm]                   = useState(EMPTY_FORM);
  const [saving, setSaving]               = useState(false);
  const [savedId, setSavedId]             = useState(null);
  const [activeSection, setActiveSection] = useState('personal');
  const [skillInput, setSkillInput]       = useState('');
  const [preview, setPreview]             = useState(false);
  const [savedList, setSavedList]         = useState([]);
  const [drawerOpen, setDrawerOpen]       = useState(false);
  const [downloading, setDownloading]     = useState(false);
  const [loadingList, setLoadingList]     = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await userAPI.getAllBuiltResumes();
        const list = data.resumes || [];
        setSavedList(list);
        if (list.length > 0) { loadIntoForm(list[0]); setSavedId(list[0]._id); }
      } catch { /* fresh user */ }
      finally { setLoadingList(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadIntoForm = (r) => setForm({
    title: r.title || 'My Resume',
    personalInfo: r.personalInfo || EMPTY_FORM.personalInfo,
    experience: r.experience || [],
    education: r.education || [],
    skills: r.skills || [],
    projects: r.projects || [],
    certifications: r.certifications || [],
    template: r.template || 'modern',
  });

  const updatePI = (f, v) => setForm(p => ({ ...p, personalInfo: { ...p.personalInfo, [f]: v } }));

  const addExp  = ()        => setForm(p => ({ ...p, experience: [...p.experience, { company: '', role: '', startDate: '', endDate: '', current: false, description: '' }] }));
  const setExp  = (i, f, v) => setForm(p => ({ ...p, experience: p.experience.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const delExp  = (i)       => setForm(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));

  const addEdu  = ()        => setForm(p => ({ ...p, education: [...p.education, { institution: '', degree: '', field: '', startDate: '', endDate: '', gpa: '' }] }));
  const setEdu  = (i, f, v) => setForm(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [f]: v } : e) }));
  const delEdu  = (i)       => setForm(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  const addSkill = ()       => { if (!skillInput.trim()) return; setForm(p => ({ ...p, skills: [...p.skills, skillInput.trim()] })); setSkillInput(''); };
  const delSkill = (i)      => setForm(p => ({ ...p, skills: p.skills.filter((_, idx) => idx !== i) }));

  const addProj  = ()       => setForm(p => ({ ...p, projects: [...p.projects, { name: '', description: '', techStack: '', link: '' }] }));
  const setProj  = (i, f, v)=> setForm(p => ({ ...p, projects: p.projects.map((x, idx) => idx === i ? { ...x, [f]: v } : x) }));
  const delProj  = (i)      => setForm(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));

  const addCert  = ()       => setForm(p => ({ ...p, certifications: [...(p.certifications || []), { name: '', issuer: '', date: '', link: '' }] }));
  const setCert  = (i, f, v)=> setForm(p => ({ ...p, certifications: (p.certifications || []).map((c, idx) => idx === i ? { ...c, [f]: v } : c) }));
  const delCert  = (i)      => setForm(p => ({ ...p, certifications: (p.certifications || []).filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.personalInfo.fullName && !form.personalInfo.email) { toast.error('Please add at least your name or email first'); return; }
    setSaving(true);
    try {
      const payload = savedId ? { id: savedId, ...form } : form;
      const { data } = await userAPI.saveResumeBuilder(payload);
      setSavedId(data.resume._id);
      const listRes = await userAPI.getAllBuiltResumes();
      setSavedList(listRes.data.resumes || []);
      toast.success('Resume saved!');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleLoad = (resume) => {
    if (!resume) { setForm(EMPTY_FORM); setSavedId(null); setActiveSection('personal'); setPreview(false); toast('New blank resume ready', { icon: '📄' }); return; }
    loadIntoForm(resume); setSavedId(resume._id); setPreview(false);
    toast.success(`Loaded: "${resume.title || 'My Resume'}"`, { icon: '📂' });
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return;
    setSavedList(prev => prev.filter(r => r._id !== id));
    if (savedId === id) { setForm(EMPTY_FORM); setSavedId(null); }
    toast.success('Resume deleted');
  };

  const handleDownloadPDF = () => {
    const el = document.getElementById('resume-preview');
    if (!el) { toast.error('Preview element not found. Please refresh the page.'); return; }
    setDownloading(true);
    const name = form.personalInfo?.fullName || 'Resume';
    const win = window.open('', '_blank', 'width=900,height=750');
    if (!win) { toast.error('Popup blocked! Please allow popups for this site.'); setDownloading(false); return; }
    win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${name} - Resume</title><style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc}@page{size:A4;margin:0}@media print{body{background:white}.topbar{display:none!important}.resume-wrap{box-shadow:none!important;margin:0!important;border-radius:0!important}}.topbar{position:fixed;top:0;left:0;right:0;z-index:99;background:#0f172a;padding:12px 24px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,0.1)}.topbar p{color:#94a3b8;font-size:13px}.save-btn{background:linear-gradient(135deg,#0ea5e9,#8b5cf6);color:white;border:none;border-radius:8px;padding:9px 22px;font-size:14px;font-weight:600;cursor:pointer}.save-btn:hover{opacity:0.9}.resume-wrap{margin:72px auto 32px;max-width:794px;background:white;box-shadow:0 4px 40px rgba(0,0,0,0.15);border-radius:4px;overflow:hidden}</style></head><body><div class="topbar"><p>📄 ${name} — Resume</p><button class="save-btn" onclick="window.print()">⬇️ Save as PDF (Ctrl+P)</button></div><div class="resume-wrap">${el.outerHTML}</div></body></html>`);
    win.document.close(); win.focus();
    setDownloading(false);
    toast.success('New tab opened! Click "Save as PDF" or press Ctrl+P', { duration: 6000 });
  };

  const sections = [
    { id: 'personal',       label: 'Personal',       Icon: User,           badge: 0 },
    { id: 'experience',     label: 'Experience',     Icon: Briefcase,      badge: form.experience.length },
    { id: 'education',      label: 'Education',      Icon: GraduationCap,  badge: form.education.length },
    { id: 'skills',         label: 'Skills',         Icon: Zap,            badge: form.skills.length },
    { id: 'projects',       label: 'Projects',       Icon: Rocket,         badge: form.projects.length },
    { id: 'certifications', label: 'Certifications', Icon: Award,          badge: (form.certifications || []).length },
  ];

  if (loadingList) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={36} className="text-sky-500 animate-spin" />
        <p className="text-slate-400 text-sm">Loading your saved resumes...</p>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 py-8">

      <SavedResumesDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} savedList={savedList} onLoad={handleLoad} onDelete={handleDelete} currentId={savedId} />

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div>
          <h1 className="text-3xl font-bold text-white">Resume <span className="gradient-text">Builder</span></h1>
          <p className="text-slate-400 text-sm mt-1">Build a professional ATS-friendly resume</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setDrawerOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass hover:glass-light border border-white/10 text-sm font-medium text-slate-300 hover:text-white transition-all">
            <FolderOpen size={15} />
            <span className="hidden sm:inline">My Resumes</span>
            {savedList.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-sky-500 text-white text-xs flex items-center justify-center font-bold">{savedList.length}</span>
            )}
          </button>

          <button onClick={() => setPreview(!preview)} className="flex items-center gap-2 btn-secondary text-sm px-4 py-2.5">
            {preview ? <EyeOff size={15} /> : <Eye size={15} />}
            <span>{preview ? 'Back to Edit' : 'Preview'}</span>
          </button>

          <button onClick={handleDownloadPDF} disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 hover:border-green-500/40 transition-all disabled:opacity-50">
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span className="hidden sm:inline">{downloading ? 'Opening...' : 'Download PDF'}</span>
            <span className="sm:hidden">PDF</span>
          </button>

          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2 disabled:opacity-60">
            {saving
              ? <><Loader2 size={14} className="animate-spin" /><span>Saving...</span></>
              : <><Save size={14} /><span>Save</span></>
            }
          </button>
        </div>
      </div>

      {/* Resume Title + Save status */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <input type="text" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          className="bg-transparent text-slate-300 border-b border-slate-700 hover:border-slate-500 focus:border-sky-500 outline-none px-1 py-1 text-sm transition-colors w-44" placeholder="Resume title..." />
        {savedId ? (
          <span className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Saved to account
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800/50 px-2.5 py-1 rounded-full border border-slate-700">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" /> Not saved yet
          </span>
        )}
      </div>

      {/* Preview Panel */}
      <div style={{ display: preview ? 'block' : 'none' }}>
        <div className="flex items-center justify-between mb-4 px-1">
          <p className="text-slate-400 text-sm flex items-center gap-2"><FileText size={14} /> A4 preview — exactly how your resume will print</p>
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-green-500 hover:bg-green-400 text-white transition-all">
            <Download size={15} /> Download as PDF
          </button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-white/10 shadow-2xl bg-white">
          <ResumePreview data={form} />
        </div>
      </div>

      {/* Editor Panel */}
      {!preview && (
        <div className="grid lg:grid-cols-[220px,1fr] gap-6">
          {/* Sidebar */}
          <div className="space-y-1">
            {sections.map(({ id, label, Icon, badge }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${
                  activeSection === id ? 'bg-sky-500/15 text-sky-400 border border-sky-500/20' : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}>
                <span className="flex items-center gap-2"><Icon size={15} /> {label}</span>
                {badge > 0 && <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center">{badge}</span>}
              </button>
            ))}
            <div className="mt-4 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
              <p className="text-xs text-slate-500 leading-relaxed flex gap-1.5">
                <Lightbulb size={12} className="text-yellow-400 mt-0.5 shrink-0" />
                <span>Fill sections → click <span className="text-sky-400">Preview</span> → then <span className="text-green-400">Download PDF</span>. PDF also works directly from editor!</span>
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div>

            {/* Personal */}
            {activeSection === 'personal' && (
              <Section title="Personal Information">
                <div className="grid sm:grid-cols-2 gap-4">
                  <InputGroup label="Full Name *"       value={form.personalInfo.fullName}  onChange={v => updatePI('fullName', v)}  placeholder="Rahul Sharma" />
                  <InputGroup label="Email *"           value={form.personalInfo.email}     onChange={v => updatePI('email', v)}     placeholder="rahul@example.com" type="email" />
                  <InputGroup label="Phone"             value={form.personalInfo.phone}     onChange={v => updatePI('phone', v)}     placeholder="+91 9876543210" />
                  <InputGroup label="Location"          value={form.personalInfo.location}  onChange={v => updatePI('location', v)}  placeholder="Mumbai, India" />
                  <InputGroup label="LinkedIn URL"      value={form.personalInfo.linkedin}  onChange={v => updatePI('linkedin', v)}  placeholder="linkedin.com/in/rahulsharma" />
                  <InputGroup label="GitHub URL"        value={form.personalInfo.github}    onChange={v => updatePI('github', v)}    placeholder="github.com/rahulsharma" />
                  <InputGroup label="Portfolio Website" value={form.personalInfo.website}   onChange={v => updatePI('website', v)}   placeholder="https://rahulsharma.dev" />
                  <div />
                  <div className="sm:col-span-2">
                    <InputGroup label="Professional Summary" value={form.personalInfo.summary} onChange={v => updatePI('summary', v)}
                      placeholder="Results-driven software engineer with 3+ years of experience in full-stack development..." rows={4} />
                  </div>
                </div>
              </Section>
            )}

            {/* Experience */}
            {activeSection === 'experience' && (
              <Section title="Work Experience" onAdd={addExp} addLabel="Add Experience">
                {form.experience.length === 0 && (
                  <div className="text-center py-12 text-slate-600">
                    <Briefcase size={44} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No experience added yet</p>
                    <p className="text-xs mt-1">Click "+ Add Experience" above</p>
                  </div>
                )}
                <div className="space-y-4">
                  {form.experience.map((exp, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience #{i + 1}</span>
                        <button onClick={() => delExp(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all">
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Company"    value={exp.company}   onChange={v => setExp(i, 'company', v)}   placeholder="Google" />
                        <InputGroup label="Job Title"  value={exp.role}      onChange={v => setExp(i, 'role', v)}      placeholder="Software Engineer" />
                        <InputGroup label="Start Date" value={exp.startDate} onChange={v => setExp(i, 'startDate', v)} placeholder="Jan 2022" />
                        <div>
                          <InputGroup label="End Date" value={exp.current ? '' : exp.endDate} onChange={v => setExp(i, 'endDate', v)} placeholder="Dec 2023" />
                          <label className="flex items-center gap-2 mt-2 text-xs text-slate-400 cursor-pointer select-none">
                            <input type="checkbox" checked={exp.current} onChange={e => setExp(i, 'current', e.target.checked)} className="accent-sky-500 w-3.5 h-3.5" />
                            Currently working here
                          </label>
                        </div>
                        <div className="sm:col-span-2">
                          <InputGroup label="Responsibilities & Achievements" value={exp.description} onChange={v => setExp(i, 'description', v)}
                            placeholder="• Led development of microservices serving 1M+ users&#10;• Reduced load time by 40% via Redis caching" rows={4} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Education */}
            {activeSection === 'education' && (
              <Section title="Education" onAdd={addEdu} addLabel="Add Education">
                {form.education.length === 0 && (
                  <div className="text-center py-12 text-slate-600">
                    <GraduationCap size={44} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No education added yet</p>
                  </div>
                )}
                <div className="space-y-4">
                  {form.education.map((edu, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Education #{i + 1}</span>
                        <button onClick={() => delEdu(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all">
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Institution"    value={edu.institution} onChange={v => setEdu(i, 'institution', v)} placeholder="IIT Bombay" />
                        <InputGroup label="Degree"         value={edu.degree}      onChange={v => setEdu(i, 'degree', v)}      placeholder="B.Tech / MCA / BCA" />
                        <InputGroup label="Field of Study" value={edu.field}       onChange={v => setEdu(i, 'field', v)}       placeholder="Computer Science" />
                        <InputGroup label="GPA / %"        value={edu.gpa}         onChange={v => setEdu(i, 'gpa', v)}         placeholder="8.5/10 or 85%" />
                        <InputGroup label="Start Year"     value={edu.startDate}   onChange={v => setEdu(i, 'startDate', v)}   placeholder="2019" />
                        <InputGroup label="End Year"       value={edu.endDate}     onChange={v => setEdu(i, 'endDate', v)}     placeholder="2023" />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Skills */}
            {activeSection === 'skills' && (
              <Section title="Skills">
                <p className="text-xs text-slate-500 mb-4">Add technical and soft skills. Press Enter or click Add after each one.</p>
                <div className="flex gap-2 mb-5">
                  <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, Node.js, Python, SQL, Docker..." className="input-field flex-1 text-sm" />
                  <button onClick={addSkill} className="btn-primary px-4 py-2.5 text-sm whitespace-nowrap flex items-center gap-1.5">
                    <Plus size={13} /> Add
                  </button>
                </div>
                {form.skills.length === 0 ? (
                  <div className="text-center py-10 text-slate-600 border-2 border-dashed border-slate-700 rounded-xl">
                    <Zap size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No skills yet — type above and press Enter!</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-slate-500 mb-3">{form.skills.length} skill{form.skills.length !== 1 ? 's' : ''} — click × to remove</p>
                    <div className="flex flex-wrap gap-2">
                      {form.skills.map((skill, i) => (
                        <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 text-sky-400 text-sm rounded-lg border border-sky-500/20 hover:border-sky-500/40 transition-all">
                          {skill}
                          <button onClick={() => delSkill(i)} className="text-sky-600 hover:text-red-400 transition-colors ml-1"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </Section>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <Section title="Projects" onAdd={addProj} addLabel="Add Project">
                {form.projects.length === 0 && (
                  <div className="text-center py-12 text-slate-600">
                    <Rocket size={44} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No projects added yet</p>
                  </div>
                )}
                <div className="space-y-4">
                  {form.projects.map((proj, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Project #{i + 1}</span>
                        <button onClick={() => delProj(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all">
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Project Name"       value={proj.name}        onChange={v => setProj(i, 'name', v)}        placeholder="E-Commerce Platform" />
                        <InputGroup label="Tech Stack"         value={proj.techStack}   onChange={v => setProj(i, 'techStack', v)}   placeholder="React, Node.js, MongoDB" />
                        <InputGroup label="GitHub / Live URL"  value={proj.link}        onChange={v => setProj(i, 'link', v)}        placeholder="https://github.com/you/project" />
                        <div />
                        <div className="sm:col-span-2">
                          <InputGroup label="Description" value={proj.description} onChange={v => setProj(i, 'description', v)}
                            placeholder="Built a full-stack e-commerce platform with Razorpay integration, serving 500+ users." rows={3} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Certifications */}
            {activeSection === 'certifications' && (
              <Section title="Certifications" onAdd={addCert} addLabel="Add Certification">
                {(!form.certifications || form.certifications.length === 0) && (
                  <div className="text-center py-12 text-slate-600">
                    <Award size={44} className="mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No certifications added yet</p>
                  </div>
                )}
                <div className="space-y-4">
                  {(form.certifications || []).map((cert, i) => (
                    <div key={i} className="p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Certification #{i + 1}</span>
                        <button onClick={() => delCert(i)} className="flex items-center gap-1 text-xs text-red-400/60 hover:text-red-400 border border-red-500/20 hover:border-red-500/40 px-2.5 py-1 rounded-lg transition-all">
                          <Trash2 size={11} /> Remove
                        </button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <InputGroup label="Certification Name"   value={cert.name}   onChange={v => setCert(i, 'name', v)}   placeholder="AWS Solutions Architect" />
                        <InputGroup label="Issuing Organization" value={cert.issuer} onChange={v => setCert(i, 'issuer', v)} placeholder="Amazon Web Services" />
                        <InputGroup label="Date Earned"          value={cert.date}   onChange={v => setCert(i, 'date', v)}   placeholder="March 2024" />
                        <InputGroup label="Verify URL"           value={cert.link}   onChange={v => setCert(i, 'link', v)}   placeholder="https://verify.credly.com/..." />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Bottom Action Bar */}
            <div className="mt-6 flex items-center justify-between p-4 rounded-xl glass border border-white/5 gap-4">
              <p className="text-slate-500 text-sm hidden sm:flex items-center gap-2">
                {savedId
                  ? <><CheckCircle2 size={14} className="text-green-400" /> Progress saved — you can close and come back anytime</>
                  : <><Lightbulb size={14} className="text-yellow-400" /> Save to access this resume from any device</>
                }
              </p>
              <div className="flex gap-2 ml-auto">
                <button onClick={() => setPreview(true)} className="btn-secondary text-sm px-4 py-2 flex items-center gap-2">
                  <Eye size={14} /> Preview <ArrowRight size={13} />
                </button>
                <button onClick={handleSave} disabled={saving} className="btn-primary text-sm px-5 py-2 disabled:opacity-60 flex items-center gap-2">
                  {saving ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : <><Save size={13} /> Save Resume</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden preview for PDF (always in DOM) */}
      {!preview && (
        <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', visibility: 'hidden', pointerEvents: 'none', width: '794px' }}>
          <ResumePreview data={form} />
        </div>
      )}
    </div>
  );
}