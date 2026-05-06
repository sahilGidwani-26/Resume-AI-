import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { resumeAPI } from '../utils/api';
import toast from 'react-hot-toast';

const ScoreCircle = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#eab308' : '#ef4444';
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-36 h-36">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="50" cy="50" r="45" fill="none"
          stroke={color} strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-slate-500 text-xs">/100</span>
      </div>
    </div>
  );
};

const SkillTag = ({ skill, type }) => (
  <span className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
    type === 'good'
      ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
      : 'bg-red-500/10 text-red-400 border-red-500/20'
  }`}>
    {type === 'good' ? '✓' : '✗'} {skill}
  </span>
);

export default function ResumeAnalysisPage() {
  const { id } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchResume = async () => {
      try {
        const { data } = await resumeAPI.getById(id);
        setResume(data.resume);
      } catch {
        toast.error('Failed to load analysis');
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
    </div>
  );

  if (!resume) return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center">
      <p className="text-slate-400 mb-4">Resume not found</p>
      <Link to="/upload" className="btn-primary">Upload New Resume</Link>
    </div>
  );

  const tabs = ['overview', 'skills', 'improvements', 'jobs'];

  const scoreLabel = resume.atsScore >= 80 ? 'Excellent' : resume.atsScore >= 60 ? 'Good' : 'Needs Work';
  const scoreLabelColor = resume.atsScore >= 80 ? 'text-green-400' : resume.atsScore >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/dashboard" className="text-slate-500 hover:text-white transition-colors">← Back</Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Resume Analysis</h1>
          <p className="text-slate-500 text-sm">{resume.fileName} · {new Date(resume.analysisDate).toLocaleDateString()}</p>
        </div>
      </div>

      {/* Score Hero */}
      <div className="card glow-blue mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="flex flex-col items-center">
            <ScoreCircle score={resume.atsScore} />
            <p className={`text-lg font-semibold mt-2 ${scoreLabelColor}`}>{scoreLabel}</p>
            <p className="text-slate-500 text-sm">ATS Score</p>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-3">Overall Assessment</h2>
            <p className="text-slate-300 leading-relaxed mb-4">{resume.overallFeedback}</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20">
                <p className="text-green-400 font-semibold text-sm mb-1">✓ Strengths</p>
                <p className="text-slate-400 text-sm">{resume.strengths?.length || 0} identified</p>
              </div>
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <p className="text-red-400 font-semibold text-sm mb-1">✗ Missing Skills</p>
                <p className="text-slate-400 text-sm">{resume.missingSkills?.length || 0} detected</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {tab === 'jobs' ? 'Job Matches' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-green-400">✓</span> Strengths
              </h3>
              <ul className="space-y-3">
                {resume.strengths?.map((s, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="text-green-500 mt-0.5">→</span> {s}
                  </li>
                ))}
              </ul>
            </div>
            {/* Weaknesses */}
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="text-red-400">⚠</span> Weaknesses
              </h3>
              <ul className="space-y-3">
                {resume.weaknesses?.map((w, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-300 text-sm">
                    <span className="text-red-500 mt-0.5">→</span> {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Detected Skills ({resume.extractedSkills?.length})</h3>
              <div className="flex flex-wrap gap-2">
                {resume.extractedSkills?.map((s) => <SkillTag key={s} skill={s} type="good" />)}
              </div>
            </div>
            <div className="card">
              <h3 className="text-lg font-semibold text-white mb-4">Missing Skills ({resume.missingSkills?.length})</h3>
              <p className="text-slate-500 text-sm mb-4">Add these skills to significantly improve your ATS score and job matches:</p>
              <div className="flex flex-wrap gap-2">
                {resume.missingSkills?.map((s) => <SkillTag key={s} skill={s} type="missing" />)}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'improvements' && (
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-6">AI-Powered Improvements</h3>
            <div className="space-y-4">
              {resume.improvements?.map((imp, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-white/2 border border-white/5 hover:border-white/10 transition-all">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">{imp}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="space-y-4">
            {resume.jobRecommendations?.map((job, i) => (
              <div key={i} className="card hover:glass-light transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
                      <span className={`stat-badge ${
                        job.matchScore >= 80 ? 'bg-green-500/15 text-green-400' :
                        job.matchScore >= 60 ? 'bg-yellow-500/15 text-yellow-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {job.matchScore}% match
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-3">{job.description}</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {job.requiredSkills?.map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">{s}</span>
                      ))}
                    </div>
                    <p className="text-sky-400 text-sm font-medium">💰 {job.salaryRange}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center text-2xl">
                      {['💻', '📊', '🎨', '🔧', '📱', '🤖'][i % 6]}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="text-center pt-4">
              <Link to="/jobs" className="btn-primary inline-block">
                Explore More Job Matches →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}