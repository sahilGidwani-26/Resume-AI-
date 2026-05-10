import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BarChart2, ArrowLeft, CheckCircle, AlertCircle,
  Loader2, RefreshCw, ExternalLink, TrendingUp,
  Globe, Layers, Zap, Star, Target,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getPortfolioById, analyzePortfolio } from '../utils/portfolio.service';

// ─── Dimension score bar ────────────────────────────────────────────────────────
const DimBar = ({ label, score, icon: Icon }) => {
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs text-slate-400">
          <Icon size={12} /> {label}
        </span>
        <span className="text-xs font-semibold" style={{ color }}>{score}/100</span>
      </div>
      <div className="h-1.5 bg-white/[0.05] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

// ─── Big score ring ─────────────────────────────────────────────────────────────
const ScoreRing = ({ score, grade }) => {
  const color = score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f87171';
  const r = 52, cx = 64, cy = 64;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={128} height={128}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={color} strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
        <text x={cx} y={cy - 6} textAnchor="middle" fill={color} fontSize={26} fontWeight={700}>{score}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fill="#64748b" fontSize={10}>/100</text>
      </svg>
      <span className="text-sm font-semibold" style={{ color }}>{grade}</span>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
export default function PortfolioAnalysisPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await getPortfolioById(id);
      if (data.success) {
        setPortfolio(data.portfolio);
        setReport(data.portfolio.analysisReport);
      }
    } catch { toast.error('Failed to load portfolio'); }
    finally { setLoading(false); }
  };

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      const { data } = await analyzePortfolio(id);
      if (data.success) {
        setReport(data.report);
        setPortfolio(prev => ({ ...prev, analysisScore: data.report.score, analysisReport: data.report }));
        toast.success('Re-analysis complete!');
      }
    } catch { toast.error('Analysis failed'); }
    finally { setReanalyzing(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#080d1a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-sky-400" />
    </div>
  );

  if (!report) return (
    <div className="min-h-screen bg-[#080d1a] flex flex-col items-center justify-center gap-4">
      <AlertCircle size={40} className="text-yellow-400" />
      <p className="text-slate-300 font-medium">No analysis report yet.</p>
      <button onClick={() => navigate('/portfolio')} className="text-sky-400 text-sm hover:underline flex items-center gap-1.5">
        <ArrowLeft size={14} /> Back to Portfolios
      </button>
    </div>
  );

  const dims = report.dimensionScores || {};
  const dimIcons = {
    completeness: Layers, impact: Zap, presentation: Star,
    onlinePresence: Globe, skillsCoverage: Target, projectQuality: TrendingUp,
  };
  const dimLabels = {
    completeness: 'Completeness', impact: 'Impact',
    presentation: 'Presentation', onlinePresence: 'Online Presence',
    skillsCoverage: 'Skills Coverage', projectQuality: 'Project Quality',
  };

  return (
    <div className="min-h-screen bg-[#080d1a] text-slate-100 p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/portfolio')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-400 transition-all"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-white flex items-center gap-2.5">
              <BarChart2 size={22} className="text-violet-400" />
              Portfolio Analysis — {portfolio?.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Last analyzed {portfolio?.lastAnalyzedAt ? new Date(portfolio.lastAnalyzedAt).toLocaleString() : 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`/portfolio/${portfolio?.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 rounded-xl text-xs font-medium transition-all"
            >
              <ExternalLink size={13} /> View Portfolio
            </a>
            <button
              onClick={handleReanalyze}
              disabled={reanalyzing}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-500/15 hover:bg-violet-500/25 text-violet-400 border border-violet-500/20 rounded-xl text-xs font-medium transition-all disabled:opacity-60"
            >
              {reanalyzing ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
              {reanalyzing ? 'Analyzing…' : 'Re-analyze'}
            </button>
          </div>
        </div>

        {/* Top grid */}
        <div className="grid lg:grid-cols-3 gap-5 mb-5">

          {/* Score ring */}
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
            <ScoreRing score={report.score} grade={report.grade} />
            <p className="text-xs text-slate-500 text-center leading-relaxed">{report.summary}</p>
          </div>

          {/* Dimension bars */}
          <div className="lg:col-span-2 bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-slate-300 mb-5">Dimension Breakdown</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
              {Object.entries(dims).map(([key, score]) => (
                <DimBar key={key} label={dimLabels[key] || key} score={score} icon={dimIcons[key] || Star} />
              ))}
            </div>
          </div>
        </div>

        {/* Strengths + Weaknesses */}
        <div className="grid lg:grid-cols-2 gap-5 mb-5">
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
              <CheckCircle size={15} /> Strengths
            </h2>
            <ul className="space-y-2.5">
              {(report.strengths || []).map((s, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
              <AlertCircle size={15} /> Weaknesses
            </h2>
            <ul className="space-y-2.5">
              {(report.weaknesses || []).map((w, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <AlertCircle size={14} className="text-red-400 mt-0.5 shrink-0" />
                  {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Improvements */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 mb-5">
          <h2 className="text-sm font-bold text-sky-400 mb-5 flex items-center gap-2">
            <TrendingUp size={15} /> Actionable Improvements
          </h2>
          <div className="grid gap-3">
            {(report.improvements || []).map((imp, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-full">
                    {imp.section || `#${i + 1}`}
                  </span>
                </div>
                {imp.issue && <p className="text-xs text-slate-500 mb-1.5">⚠ {imp.issue}</p>}
                <p className="text-sm text-slate-300">✓ {imp.fix}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Missing elements */}
        {report.missingElements?.length > 0 && (
          <div className="bg-yellow-500/5 border border-yellow-500/15 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <AlertCircle size={15} /> Missing Elements
            </h2>
            <div className="flex flex-wrap gap-2">
              {report.missingElements.map((el, i) => (
                <span key={i} className="text-xs px-3 py-1.5 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-full">
                  {el}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}