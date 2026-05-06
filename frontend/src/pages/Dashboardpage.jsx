import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { userAPI, resumeAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StatCard = ({ icon, label, value, color }) => (
  <div className="card group hover:scale-[1.02] transition-transform duration-200">
    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${color} mb-3`}>
      <span className="text-xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold text-white mb-1">{value}</p>
    <p className="text-slate-500 text-sm">{label}</p>
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await userAPI.getDashboard();
        setData(res.data);
      } catch (err) {
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
      setData((prev) => ({
        ...prev,
        recentResumes: prev.recentResumes.filter((r) => r._id !== id),
        stats: { ...prev.stats, totalResumes: prev.stats.totalResumes - 1 },
      }));
      toast.success('Resume deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <p className="text-slate-400">Loading dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-400">Here's your career dashboard overview</p>
        </div>
        <Link to="/upload" className="btn-primary hidden sm:block">
          + Upload Resume
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 stagger">
        <StatCard icon="📄" label="Resumes Analyzed" value={data?.stats?.totalResumes || 0} color="bg-sky-500/15" />
        <StatCard icon="🎯" label="Avg. ATS Score" value={`${data?.stats?.avgAtsScore || 0}`} color="bg-violet-500/15" />
        <StatCard icon="⚡" label="Skills Detected" value={data?.stats?.totalSkills || 0} color="bg-pink-500/15" />
        <StatCard icon="🏗️" label="Resumes Built" value={data?.stats?.builtResumes || 0} color="bg-green-500/15" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Resumes */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Analyses</h2>
            <Link to="/upload" className="text-sm text-sky-400 hover:text-sky-300">+ New</Link>
          </div>

          {!data?.recentResumes?.length ? (
            <div className="card text-center py-12">
              <div className="text-5xl mb-4">📄</div>
              <h3 className="text-white font-semibold mb-2">No resumes yet</h3>
              <p className="text-slate-500 text-sm mb-4">Upload your first resume to get AI-powered analysis</p>
              <Link to="/upload" className="btn-primary inline-block">Upload Resume →</Link>
            </div>
          ) : (
            <div className="space-y-3 stagger">
              {data.recentResumes.map((resume) => (
                <div key={resume._id} className="card hover:glass-light transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500/20 to-violet-600/20 flex items-center justify-center flex-shrink-0">
                        <span>📄</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-white font-medium truncate text-sm">{resume.fileName}</p>
                        <p className="text-slate-500 text-xs">{new Date(resume.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {resume.atsScore !== undefined && (
                        <div className="text-right">
                          <p className={`text-xl font-bold ${getScoreColor(resume.atsScore)}`}>{resume.atsScore}</p>
                          <p className="text-xs text-slate-500">ATS</p>
                        </div>
                      )}
                      <div className="flex gap-1">
                        <Link
                          to={`/analysis/${resume._id}`}
                          className="px-3 py-1.5 text-xs glass hover:glass-light rounded-lg text-sky-400 transition-all"
                        >
                          View →
                        </Link>
                        <button
                          onClick={() => handleDelete(resume._id)}
                          className="px-3 py-1.5 text-xs glass hover:bg-red-500/15 rounded-lg text-slate-500 hover:text-red-400 transition-all"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  </div>
                  {resume.extractedSkills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {resume.extractedSkills.slice(0, 6).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-xs rounded border border-sky-500/20">{s}</span>
                      ))}
                      {resume.extractedSkills.length > 6 && (
                        <span className="px-2 py-0.5 bg-slate-700/50 text-slate-500 text-xs rounded">+{resume.extractedSkills.length - 6}</span>
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
          <div className="card">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {[
                { label: 'Upload & Analyze Resume', path: '/upload', icon: '↑', color: 'text-sky-400' },
                { label: 'Browse Job Matches', path: '/jobs', icon: '◈', color: 'text-violet-400' },
                { label: 'Build New Resume', path: '/builder', icon: '✦', color: 'text-pink-400' },
              ].map(a => (
                <Link key={a.path} to={a.path} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-all group">
                  <span className={`${a.color} text-lg`}>{a.icon}</span>
                  <span className="text-slate-300 group-hover:text-white text-sm transition-colors">{a.label}</span>
                  <span className="ml-auto text-slate-600 group-hover:text-slate-400">→</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Skills Overview */}
          {user?.skills?.length > 0 && (
            <div className="card">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Your Top Skills</h3>
              <div className="flex flex-wrap gap-2">
                {user.skills.slice(0, 12).map(skill => (
                  <span key={skill} className="px-2 py-1 bg-violet-500/10 text-violet-400 text-xs rounded-lg border border-violet-500/20">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="card border border-sky-500/20">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sky-400">💡</span>
              <h3 className="text-sm font-semibold text-sky-400">Pro Tip</h3>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Tailor your resume for each job application. ATS systems scan for specific keywords matching the job description.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}