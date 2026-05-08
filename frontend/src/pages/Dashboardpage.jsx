import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, resumeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  FileText, Target, Zap, Layers, Upload, Briefcase,
  PenTool, Map, Mic, BookOpen, TrendingUp, ChevronRight,
  Trash2, Eye, Award, AlertCircle, CheckCircle, Clock,
  BarChart2, Star, ArrowUpRight
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';

// ── HELPERS ───────────────────────────────────────────────────────────────────
const getScoreColor = (s) => s >= 80 ? '#10b981' : s >= 60 ? '#f59e0b' : '#ef4444';
const getScoreText = (s) => s >= 80 ? 'text-emerald-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400';
const getScoreBadge = (s) => s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : 'Needs Work';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

// ── STAT CARD ─────────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex items-start gap-4 hover:border-white/10 transition-all group">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={20} className="opacity-90" />
    </div>
    <div className="min-w-0">
      <p className="text-2xl font-bold text-white leading-none mb-1">{value}</p>
      <p className="text-slate-500 text-xs">{label}</p>
      {sub && <p className="text-xs text-slate-600 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── CUSTOM TOOLTIP ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="text-white font-bold">{payload[0]?.value} ATS</p>
    </div>
  );
};

// ── QUICK ACTION ──────────────────────────────────────────────────────────────
const QuickAction = ({ icon: Icon, label, path, color, desc }) => (
  <Link to={path}
    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-all group border border-transparent hover:border-white/5">
    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-slate-200 group-hover:text-white text-sm font-medium transition-colors">{label}</p>
      {desc && <p className="text-slate-600 text-xs truncate">{desc}</p>}
    </div>
    <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
  </Link>
);

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await userAPI.getDashboard();
        setData(res.data);
      } catch {
        toast.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resume?')) return;
    try {
      await resumeAPI.delete(id);
      setData(prev => ({
        ...prev,
        recentResumes: prev.recentResumes.filter(r => r._id !== id),
        stats: { ...prev.stats, totalResumes: prev.stats.totalResumes - 1 },
      }));
      toast.success('Resume deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400 text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  const resumes = data?.recentResumes || [];
  const stats = data?.stats || {};
  const avgScore = stats.avgAtsScore || 0;

  // Chart data - ATS scores over resumes
  const chartData = resumes.slice().reverse().map((r, i) => ({
    name: `Resume ${i + 1}`,
    score: r.atsScore || 0,
    short: r.fileName?.split('.')[0]?.slice(0, 8) || `R${i + 1}`,
  }));

  // Score distribution for pie
  const scoreDistData = [
    { name: 'Excellent (80+)', value: resumes.filter(r => r.atsScore >= 80).length, color: '#10b981' },
    { name: 'Good (60-79)', value: resumes.filter(r => r.atsScore >= 60 && r.atsScore < 80).length, color: '#f59e0b' },
    { name: 'Needs Work (<60)', value: resumes.filter(r => r.atsScore < 60).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Radial data for avg score
  const radialData = [{ value: avgScore, fill: getScoreColor(avgScore) }];

  const quickActions = [
    { icon: Upload, label: 'Upload & Analyze Resume', path: '/upload', color: 'bg-sky-500/15 text-sky-400', desc: 'Get AI-powered ATS score' },
    { icon: Briefcase, label: 'Browse Job Matches', path: '/jobs', color: 'bg-violet-500/15 text-violet-400', desc: 'Find roles matching your skills' },
    { icon: PenTool, label: 'Build New Resume', path: '/builder', color: 'bg-pink-500/15 text-pink-400', desc: 'Create from scratch with AI' },
    { icon: Map, label: 'Generate Roadmap', path: '/roadmap', color: 'bg-emerald-500/15 text-emerald-400', desc: 'Personalized learning path' },
    { icon: BookOpen, label: 'Interview Prep', path: '/interview', color: 'bg-amber-500/15 text-amber-400', desc: 'AI-predicted questions' },
    { icon: Mic, label: 'Mock Interview', path: '/mock-interview', color: 'bg-red-500/15 text-red-400', desc: 'Voice-based simulator' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            {greeting()}, <span className="bg-gradient-to-r from-sky-400 to-violet-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 text-sm">Here's your career progress at a glance</p>
        </div>
        <Link to="/upload"
          className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition">
          <Upload size={15} /> Upload Resume
        </Link>
      </div>

      {/* ── STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={FileText} label="Resumes Analyzed" value={stats.totalResumes || 0} color="bg-sky-500/15 text-sky-400" />
        <StatCard icon={Target} label="Avg. ATS Score" value={`${avgScore}`} color="bg-violet-500/15 text-violet-400" sub={getScoreBadge(avgScore)} />
        <StatCard icon={Zap} label="Skills Detected" value={stats.totalSkills || 0} color="bg-pink-500/15 text-pink-400" />
        <StatCard icon={Layers} label="Resumes Built" value={stats.builtResumes || 0} color="bg-emerald-500/15 text-emerald-400" />
      </div>

      {/* ── CHARTS ROW ── */}
      {resumes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* ATS Score Trend - Area Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-white/5 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-white font-semibold text-sm">ATS Score Trend</p>
                <p className="text-slate-500 text-xs">Performance across your resumes</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                <TrendingUp size={11} /> Tracking
              </div>
            </div>
            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="short" tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="score" stroke="#38bdf8" strokeWidth={2} fill="url(#scoreGrad)" dot={{ fill: '#38bdf8', r: 4 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart2 size={32} className="text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-600 text-xs">Upload more resumes to see trend</p>
                </div>
              </div>
            )}
          </div>

          {/* Score Gauge + Distribution */}
          <div className="flex flex-col gap-4">

            {/* Radial Score */}
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex flex-col items-center">
              <p className="text-white font-semibold text-sm mb-1 self-start">Overall Score</p>
              <p className="text-slate-500 text-xs mb-3 self-start">Average ATS rating</p>
              <div className="relative">
                <ResponsiveContainer width={120} height={120}>
                  <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="90%"
                    startAngle={90} endAngle={-270} data={radialData}>
                    <RadialBar dataKey="value" cornerRadius={6} background={{ fill: '#1e293b' }} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-2xl font-bold ${getScoreText(avgScore)}`}>{avgScore}</span>
                  <span className="text-slate-600 text-xs">/100</span>
                </div>
              </div>
              <span className={`text-xs font-semibold mt-1 ${getScoreText(avgScore)}`}>{getScoreBadge(avgScore)}</span>
            </div>

            {/* Pie Distribution */}
            {scoreDistData.length > 0 && (
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 flex-1">
                <p className="text-white font-semibold text-sm mb-3">Score Distribution</p>
                <div className="flex items-center gap-3">
                  <PieChart width={70} height={70}>
                    <Pie data={scoreDistData} cx="50%" cy="50%" innerRadius={22} outerRadius={34} dataKey="value" strokeWidth={0}>
                      {scoreDistData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                  <div className="space-y-1.5 flex-1">
                    {scoreDistData.map((d, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                          <span className="text-slate-500 text-xs">{d.name.split(' ')[0]}</span>
                        </div>
                        <span className="text-white text-xs font-semibold">{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* Recent Resumes */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">Recent Analyses</h2>
            <Link to="/upload" className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1">
              <Upload size={12} /> New
            </Link>
          </div>

          {!resumes.length ? (
            <div className="bg-slate-900 border border-white/5 rounded-2xl text-center py-16 px-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <FileText size={28} className="text-slate-600" />
              </div>
              <h3 className="text-white font-semibold mb-2">No resumes yet</h3>
              <p className="text-slate-500 text-sm mb-5">Upload your first resume to get AI-powered analysis</p>
              <Link to="/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition">
                <Upload size={14} /> Upload Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {resumes.map((resume) => (
                <div key={resume._id} className="bg-slate-900 border border-white/5 rounded-2xl p-4 hover:border-white/10 transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-600/20 border border-white/5 flex items-center justify-center flex-shrink-0">
                        <FileText size={16} className="text-sky-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate text-sm">{resume.fileName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock size={10} className="text-slate-600" />
                          <p className="text-slate-500 text-xs">
                            {new Date(resume.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {resume.atsScore !== undefined && (
                        <div className="text-right">
                          <p className={`text-2xl font-bold leading-none ${getScoreText(resume.atsScore)}`}>{resume.atsScore}</p>
                          <p className="text-xs text-slate-600 text-right">ATS</p>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Link to={`/analysis/${resume._id}`}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-lg text-sky-400 transition-all">
                          <Eye size={12} /> View
                        </Link>
                        <button onClick={() => handleDelete(resume._id)}
                          className="p-1.5 text-xs bg-slate-800 hover:bg-red-500/15 rounded-lg text-slate-500 hover:text-red-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Score bar */}
                  {resume.atsScore !== undefined && (
                    <div className="mb-3">
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-1.5 rounded-full transition-all duration-700"
                          style={{ width: `${resume.atsScore}%`, background: getScoreColor(resume.atsScore) }} />
                      </div>
                    </div>
                  )}

                  {resume.extractedSkills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {resume.extractedSkills.slice(0, 6).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-xs rounded-md border border-sky-500/15">{s}</span>
                      ))}
                      {resume.extractedSkills.length > 6 && (
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-500 text-xs rounded-md">+{resume.extractedSkills.length - 6}</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* Quick Actions */}
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</p>
            <div className="space-y-0.5">
              {quickActions.map(a => <QuickAction key={a.path} {...a} />)}
            </div>
          </div>

          {/* Skills */}
          {user?.skills?.length > 0 && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Your Top Skills</p>
                <Star size={13} className="text-slate-600" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {user.skills.slice(0, 14).map(skill => (
                  <span key={skill} className="px-2.5 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-lg border border-violet-500/15 font-medium">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Resume Health */}
          {resumes.length > 0 && (
            <div className="bg-slate-900 border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Resume Health</p>
              <div className="space-y-2.5">
                {[
                  { label: 'ATS Optimized', ok: avgScore >= 70, icon: CheckCircle },
                  { label: 'Skills Listed', ok: (stats.totalSkills || 0) >= 5, icon: Zap },
                  { label: 'Multiple Versions', ok: (stats.totalResumes || 0) >= 2, icon: Layers },
                  { label: 'Job Matches Found', ok: true, icon: Briefcase },
                ].map(({ label, ok, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <Icon size={14} className={ok ? 'text-emerald-400' : 'text-slate-600'} />
                    <span className={`text-xs flex-1 ${ok ? 'text-slate-300' : 'text-slate-600'}`}>{label}</span>
                    {ok
                      ? <span className="text-xs text-emerald-400 font-medium">✓</span>
                      : <span className="text-xs text-slate-600">—</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pro Tip */}
          <div className="bg-sky-500/5 border border-sky-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award size={14} className="text-sky-400" />
              <p className="text-xs font-semibold text-sky-400">Pro Tip</p>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Tailor your resume for each job — ATS systems scan for specific keywords from the job description. A 70+ score dramatically increases your callback rate.
            </p>
            <Link to="/upload" className="flex items-center gap-1 text-sky-400 text-xs mt-2.5 hover:text-sky-300 transition-colors font-medium">
              Improve my score <ArrowUpRight size={11} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}