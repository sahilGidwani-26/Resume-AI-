import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe, FileText, Upload, Sparkles, ChevronRight,
  Plus, Trash2, ExternalLink, BarChart2, Eye,
  CheckCircle, AlertCircle, Loader2, Copy, Check,Link2
} from 'lucide-react';
import toast from 'react-hot-toast';
import {
  createPortfolioFromForm,
  createPortfolioFromResume,
  getUserPortfolios,
  analyzePortfolio,
  deletePortfolio,
  getPortfolioBySlug,
  analyzePortfolioUrl,
} from '../utils/portfolio.service';

// ── tiny helpers ────────────────────────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  if (score === null || score === undefined) return <span className="text-xs text-slate-500">Not analyzed</span>;
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';
  return <span className={`font-bold text-sm ${color}`}>{score}/100</span>;
};

const Tab = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all
      ${active ? 'bg-sky-500/15 border border-sky-500/30 text-sky-400' : 'text-slate-400 hover:text-slate-200 border border-transparent'}`}
  >
    <Icon size={16} />
    {label}
  </button>
);

// ── repeated form field ──────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, type = 'text', className = '' }) => (
  <div className={className}>
    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.06] transition-all"
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder, rows = 3 }) => (
  <div>
    <label className="block text-xs font-semibold text-slate-400 mb-1.5">{label}</label>
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 focus:bg-white/[0.06] transition-all resize-none"
    />
  </div>
);

// ── Dynamic list section (experience / projects / education / certs) ────────────
const DynamicSection = ({ title, items, setItems, fields, addLabel }) => {
  const add = () => {
    const blank = {};
    fields.forEach(f => (blank[f.key] = ''));
    setItems(prev => [...prev, blank]);
  };
  const remove = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
  const update = (i, key, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [key]: val } : it));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
        <button onClick={add} className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors">
          <Plus size={13} /> {addLabel}
        </button>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 relative">
            <button onClick={() => remove(i)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
            <div className="grid grid-cols-2 gap-3">
              {fields.map(f => (
                f.type === 'textarea'
                  ? <div key={f.key} className="col-span-2">
                      <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                      <textarea
                        rows={2}
                        value={item[f.key] || ''}
                        onChange={e => update(i, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-sky-500/40 resize-none"
                      />
                    </div>
                  : <div key={f.key} className={f.full ? 'col-span-2' : ''}>
                      <label className="block text-xs text-slate-500 mb-1">{f.label}</label>
                      <input
                        value={item[f.key] || ''}
                        onChange={e => update(i, f.key, e.target.value)}
                        placeholder={f.placeholder}
                        className="w-full bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-700 focus:outline-none focus:border-sky-500/40"
                      />
                    </div>
              ))}
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center py-6 text-xs text-slate-600 border border-dashed border-white/[0.06] rounded-xl">
            No {title.toLowerCase()} added yet. Click "{addLabel}" to add.
          </div>
        )}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
//  MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function PortfolioPage() {
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState('list'); // 'list' | 'generate' | 'analyze'
  const [genTab, setGenTab]   = useState('form');  // 'form' | 'resume'
  const [portfolios, setPortfolios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState(null);

  // ── Form state ───────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    name: '', title: '', email: '', phone: '', location: '',
    linkedin: '', github: '', website: '', bio: '', skills: '',
  });
  const [experience,    setExperience]    = useState([]);
  const [education,     setEducation]     = useState([]);
  const [projects,      setProjects]      = useState([]);
  const [certifications,setCertifications]= useState([]);
  const [resumeFile,    setResumeFile]    = useState(null);

  const [urlInput, setUrlInput] = useState('');
const [urlAnalyzing, setUrlAnalyzing] = useState(false);
const [urlReport, setUrlReport] = useState(null);

  // ── Analyze state ────────────────────────────────────────────────────────────
  const [analyzingId, setAnalyzingId] = useState(null);

  useEffect(() => { fetchPortfolios(); }, []);

  const fetchPortfolios = async () => {
    try {
      setListLoading(true);
      const { data } = await getUserPortfolios();
      if (data.success) setPortfolios(data.portfolios);
    } catch { toast.error('Failed to load portfolios'); }
    finally { setListLoading(false); }
  };

  // ── Copy URL ──────────────────────────────────────────────────────────────────
  const copyUrl = (slug) => {
    const url = `${window.location.origin}/portfolio/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    toast.success('Portfolio URL copied!');
    setTimeout(() => setCopiedSlug(null), 2000);
  };


 const handleUrlAnalyze = async () => {
  if (!urlInput.trim()) return toast.error('Please enter a URL');
  try {
    setUrlAnalyzing(true);
    setUrlReport(null);
    const { data } = await analyzePortfolioUrl(urlInput.trim());
    if (data.success) {
      setUrlReport(data.report);
      toast.success('Analysis complete!');
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Could not analyze this URL');
  } finally {
    setUrlAnalyzing(false);
  }
};
  // ── Submit form ───────────────────────────────────────────────────────────────
  const handleFormSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    try {
      setLoading(true);
      const payload = {
        ...form,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        experience, education, projects, certifications,
      };
      const { data } = await createPortfolioFromForm(payload);
      if (data.success) {
        toast.success('Portfolio created! 🎉');
        await fetchPortfolios();
        setMainTab('list');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create portfolio');
    } finally {
      setLoading(false);
    }
  };

  // ── Submit resume ─────────────────────────────────────────────────────────────
  const handleResumeSubmit = async () => {
    if (!resumeFile) return toast.error('Please upload a PDF resume');
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append('resume', resumeFile);
      const { data } = await createPortfolioFromResume(fd);
      if (data.success) {
        toast.success('Portfolio generated from resume! 🎉');
        await fetchPortfolios();
        setMainTab('list');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate portfolio');
    } finally {
      setLoading(false);
    }
  };

  // ── Analyze ───────────────────────────────────────────────────────────────────
  const handleAnalyze = async (id) => {
    try {
      setAnalyzingId(id);
      const { data } = await analyzePortfolio(id);
      if (data.success) {
        toast.success('Analysis complete!');
        await fetchPortfolios();
        navigate(`/portfolio/${id}/analysis`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzingId(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this portfolio?')) return;
    try {
      await deletePortfolio(id);
      toast.success('Portfolio deleted');
      setPortfolios(prev => prev.filter(p => p._id !== id));
    } catch { toast.error('Delete failed'); }
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Globe size={26} className="text-sky-400" />
              Portfolio Manager
            </h1>
            <p className="text-slate-400 text-sm mt-1">Generate, publish & analyze your professional portfolio</p>
          </div>
          <button
            onClick={() => setMainTab('generate')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-sky-500/20"
          >
            <Plus size={16} /> New Portfolio
          </button>
        </div>

        {/* ── Main tabs ── */}
        <div className="flex gap-2 mb-7">
          <Tab active={mainTab === 'list'}     onClick={() => setMainTab('list')}     icon={Globe}   label="My Portfolios" />
          <Tab active={mainTab === 'generate'} onClick={() => setMainTab('generate')} icon={Sparkles} label="Generate New" />
            <Tab active={mainTab === 'url'}      onClick={() => setMainTab('url')}      icon={Link2}    label="Analyze URL" />
        </div>

        {/* ══ LIST TAB ══════════════════════════════════════════════════════════ */}
        {mainTab === 'list' && (
          <div>
            {listLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={30} className="animate-spin text-sky-400" />
              </div>
            ) : portfolios.length === 0 ? (
              <div className="text-center py-24 border border-dashed border-white/[0.07] rounded-2xl">
                <Globe size={40} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-400 font-medium mb-2">No portfolios yet</p>
                <p className="text-slate-600 text-sm mb-5">Generate your first portfolio from a form or resume</p>
                <button
                  onClick={() => setMainTab('generate')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-all"
                >
                  <Sparkles size={15} /> Generate Portfolio
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {portfolios.map(p => (
                  <div key={p._id} className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-semibold text-white text-base truncate">{p.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            p.generatedFrom === 'resume'
                              ? 'bg-violet-500/15 text-violet-400 border border-violet-500/20'
                              : 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                          }`}>
                            {p.generatedFrom === 'resume' ? 'From Resume' : 'From Form'}
                          </span>
                          {p.isPublished && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                              Live
                            </span>
                          )}
                        </div>
                        {p.title && <p className="text-xs text-slate-500 mb-3">{p.title}</p>}
                        <div className="flex items-center gap-5 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5"><Eye size={12} /> {p.views || 0} views</span>
                          <span>Score: <ScoreBadge score={p.analysisScore} /></span>
                          <span>Created {new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => copyUrl(p.slug)}
                          title="Copy portfolio URL"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-sky-400 transition-all"
                        >
                          {copiedSlug === p.slug ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        </button>
                        <a
                          href={`/portfolio/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 hover:text-sky-400 transition-all"
                          title="View portfolio"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => handleAnalyze(p._id)}
                          disabled={analyzingId === p._id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/20 text-violet-400 rounded-lg text-xs font-medium transition-all disabled:opacity-60"
                        >
                          {analyzingId === p._id
                            ? <Loader2 size={12} className="animate-spin" />
                            : <BarChart2 size={12} />
                          }
                          {p.analysisScore ? 'Re-analyze' : 'Analyze'}
                        </button>
                        {p.analysisScore !== null && p.analysisScore !== undefined && (
                          <button
                            onClick={() => navigate(`/portfolio/${p._id}/analysis`)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 rounded-lg text-xs font-medium transition-all"
                          >
                            <ChevronRight size={12} /> View Report
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(p._id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/[0.05] hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {mainTab === 'url' && (
  <div className="max-w-2xl">
    {/* Input box */}
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6 mb-5">
      <h2 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
  <Link2 size={15} className="text-sky-400" /> Analyze Portfolio via URL
</h2>

<p className="text-xs text-slate-500 mb-4">
  Paste any public portfolio website URL to let AI scan and analyze the content 
  (e.g. <span className="text-sky-500">https://yourportfolio.netlify.app or https://john.dev</span>)
</p>
      <div className="flex gap-3">
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="https://yoursite.com/portfolio/your-slug"
          className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
        />
        <button
          onClick={handleUrlAnalyze}
          disabled={urlAnalyzing}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-60"
        >
          {urlAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <BarChart2 size={15} />}
          {urlAnalyzing ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>
    </div>

    {/* Report */}
    {urlReport && (
      <div className="space-y-4">
        {/* Score */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex items-center gap-6">
          <div className="text-center">
            <p className={`text-4xl font-black ${urlReport.score >= 80 ? 'text-emerald-400' : urlReport.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
              {urlReport.score}
            </p>
            <p className="text-xs text-slate-500 mt-1">/ 100</p>
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white mb-1">{urlReport.grade}</p>
            <p className="text-xs text-slate-400 leading-relaxed">{urlReport.summary}</p>
          </div>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-1.5">
              <CheckCircle size={12} /> Strengths
            </h3>
            <ul className="space-y-2">
              {(urlReport.strengths || []).map((s, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle size={11} className="text-emerald-500 mt-0.5 shrink-0" /> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
            <h3 className="text-xs font-bold text-red-400 mb-3 flex items-center gap-1.5">
              <AlertCircle size={12} /> Weaknesses
            </h3>
            <ul className="space-y-2">
              {(urlReport.weaknesses || []).map((w, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <AlertCircle size={11} className="text-red-400 mt-0.5 shrink-0" /> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvements */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5">
          <h3 className="text-xs font-bold text-sky-400 mb-3">Improvements</h3>
          <div className="space-y-2">
            {(urlReport.improvements || []).map((imp, i) => (
              <div key={i} className="bg-white/[0.02] rounded-xl p-3">
                {imp.section && <span className="text-[10px] font-bold text-sky-400">{imp.section} — </span>}
                <span className="text-xs text-slate-300">{imp.fix}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
  </div>
)}

        {/* ══ GENERATE TAB ══════════════════════════════════════════════════════ */}
        {mainTab === 'generate' && (
          <div>
            {/* Sub-tabs */}
            <div className="flex gap-2 mb-7">
              <Tab active={genTab === 'form'}   onClick={() => setGenTab('form')}   icon={FileText} label="Fill Form" />
              <Tab active={genTab === 'resume'} onClick={() => setGenTab('resume')} icon={Upload}   label="Upload Resume" />
            </div>

            {/* ── FORM TAB ── */}
            {genTab === 'form' && (
              <div className="space-y-8 max-w-3xl">
                {/* Personal Info */}
                <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">1</span>
                    Personal Information
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Full Name *"    value={form.name}     onChange={v => setForm(f => ({...f, name: v}))}     placeholder="Sahil Gidwani"         className="col-span-2" />
                    <Field label="Job Title"      value={form.title}    onChange={v => setForm(f => ({...f, title: v}))}    placeholder="Full Stack Developer" />
                    <Field label="Email"          value={form.email}    onChange={v => setForm(f => ({...f, email: v}))}    placeholder="sahil@example.com" />
                    <Field label="Phone"          value={form.phone}    onChange={v => setForm(f => ({...f, phone: v}))}    placeholder="+91 98765 43210" />
                    <Field label="Location"       value={form.location} onChange={v => setForm(f => ({...f, location: v}))} placeholder="Indore, MP, India" />
                    <Field label="LinkedIn URL"   value={form.linkedin} onChange={v => setForm(f => ({...f, linkedin: v}))} placeholder="linkedin.com/in/..." />
                    <Field label="GitHub URL"     value={form.github}   onChange={v => setForm(f => ({...f, github: v}))}   placeholder="github.com/..." />
                    <Field label="Personal Website" value={form.website} onChange={v => setForm(f => ({...f, website: v}))} placeholder="https://..." />
                    <TextArea label="Bio / About Me" value={form.bio} onChange={v => setForm(f => ({...f, bio: v}))} placeholder="Write a short professional bio... AI will improve it." />
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">Skills <span className="text-slate-600">(comma separated)</span></label>
                      <input
                        value={form.skills}
                        onChange={e => setForm(f => ({...f, skills: e.target.value}))}
                        placeholder="React, Node.js, Python, MongoDB, Docker..."
                        className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500/50 transition-all"
                      />
                    </div>
                  </div>
                </section>

                {/* Experience */}
                <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">2</span>
                    Work Experience
                  </h2>
                  <DynamicSection
                    title="Experience" items={experience} setItems={setExperience} addLabel="Add Experience"
                    fields={[
                      { key: 'company',     label: 'Company',     placeholder: 'Google' },
                      { key: 'role',        label: 'Role',        placeholder: 'Software Engineer' },
                      { key: 'duration',    label: 'Duration',    placeholder: 'Jan 2023 – Present' },
                      { key: 'description', label: 'Description', placeholder: 'What you did...', type: 'textarea', full: true },
                    ]}
                  />
                </section>

                {/* Education */}
                <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">3</span>
                    Education
                  </h2>
                  <DynamicSection
                    title="Education" items={education} setItems={setEducation} addLabel="Add Education"
                    fields={[
                      { key: 'institution', label: 'Institution', placeholder: 'IIT Bombay',       full: true },
                      { key: 'degree',      label: 'Degree',      placeholder: 'B.Tech CS' },
                      { key: 'year',        label: 'Year',        placeholder: '2020 – 2024' },
                    ]}
                  />
                </section>

                {/* Projects */}
                <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">4</span>
                    Projects
                  </h2>
                  <DynamicSection
                    title="Projects" items={projects} setItems={setProjects} addLabel="Add Project"
                    fields={[
                      { key: 'name',        label: 'Project Name', placeholder: 'ResumeAI', full: true },
                      { key: 'description', label: 'Description',  placeholder: 'What this project does...', type: 'textarea', full: true },
                      { key: 'techStack',   label: 'Tech Stack',   placeholder: 'React, Node, MongoDB (comma-sep)', full: true },
                      { key: 'liveUrl',     label: 'Live URL',     placeholder: 'https://...' },
                      { key: 'githubUrl',   label: 'GitHub URL',   placeholder: 'github.com/...' },
                    ]}
                  />
                </section>

                {/* Certifications */}
                <section className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-6">
                  <h2 className="text-sm font-bold text-slate-300 mb-5 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] flex items-center justify-center font-bold">5</span>
                    Certifications <span className="text-slate-600 font-normal text-xs">(optional)</span>
                  </h2>
                  <DynamicSection
                    title="Certifications" items={certifications} setItems={setCertifications} addLabel="Add Certificate"
                    fields={[
                      { key: 'name',   label: 'Certificate', placeholder: 'AWS Solutions Architect' },
                      { key: 'issuer', label: 'Issuer',      placeholder: 'Amazon Web Services' },
                      { key: 'year',   label: 'Year',        placeholder: '2024' },
                    ]}
                  />
                </section>

                {/* Submit */}
                <button
                  onClick={handleFormSubmit}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-400 hover:to-violet-400 text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-sky-500/20 disabled:opacity-60"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                  {loading ? 'Generating Portfolio…' : 'Generate Portfolio with AI ✨'}
                </button>
              </div>
            )}

            {/* ── RESUME UPLOAD TAB ── */}
            {genTab === 'resume' && (
              <div className="max-w-xl">
                <div className="bg-white/[0.02] border border-white/[0.07] rounded-2xl p-8">
                  <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-4">
                      <Upload size={28} className="text-sky-400" />
                    </div>
                    <h2 className="text-base font-bold text-white mb-2">Upload Your Resume</h2>
                    <p className="text-sm text-slate-400">Our AI will extract all info and build a stunning portfolio automatically</p>
                  </div>

                  <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-all
                    ${resumeFile ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/[0.1] hover:border-sky-500/40 hover:bg-sky-500/5'}`}>
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={e => setResumeFile(e.target.files[0] || null)}
                    />
                    {resumeFile ? (
                      <>
                        <CheckCircle size={32} className="text-emerald-400" />
                        <div className="text-center">
                          <p className="text-sm font-semibold text-emerald-400">{resumeFile.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{(resumeFile.size / 1024).toFixed(1)} KB — Click to change</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <FileText size={32} className="text-slate-600" />
                        <div className="text-center">
                          <p className="text-sm font-medium text-slate-400">Click to upload PDF resume</p>
                          <p className="text-xs text-slate-600 mt-0.5">Only PDF supported</p>
                        </div>
                      </>
                    )}
                  </label>

                  {resumeFile && (
                    <div className="mt-4 bg-sky-500/5 border border-sky-500/10 rounded-xl p-4 text-xs text-slate-400 space-y-1">
                      <p className="flex items-center gap-2"><CheckCircle size={12} className="text-sky-400" /> Extracts name, contact, skills</p>
                      <p className="flex items-center gap-2"><CheckCircle size={12} className="text-sky-400" /> Polishes experience descriptions</p>
                      <p className="flex items-center gap-2"><CheckCircle size={12} className="text-sky-400" /> Generates professional bio</p>
                      <p className="flex items-center gap-2"><CheckCircle size={12} className="text-sky-400" /> Creates shareable portfolio URL</p>
                    </div>
                  )}

                  <button
                    onClick={handleResumeSubmit}
                    disabled={loading || !resumeFile}
                    className="mt-6 w-full flex items-center justify-center gap-2.5 py-3.5 bg-gradient-to-r from-sky-500 to-violet-500 hover:from-sky-400 hover:to-violet-400 text-white rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                    {loading ? 'Building Portfolio…' : 'Build Portfolio from Resume ✨'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}