import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Code2, BarChart2, Palette, Wrench, Smartphone, Bot, Cloud, ShieldCheck,
  Database, Globe, Cpu, Terminal, Layers, Zap, Briefcase, Upload,
  TrendingUp, DollarSign, Building2, Star, ChevronRight, Filter, RefreshCw
} from 'lucide-react';

const JOB_ICONS = [Code2, BarChart2, Palette, Wrench, Smartphone, Bot, Cloud, ShieldCheck, Database, Globe, Cpu, Terminal, Layers, Zap];

const JobCard = ({ job, index }) => {
  const Icon = JOB_ICONS[index % JOB_ICONS.length];
  return (
    <div className="card hover:glass-light transition-all duration-200 group w-full">
      <div className="flex items-start gap-4 w-full">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Icon size={22} className="text-sky-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-white font-semibold group-hover:text-sky-400 transition-colors">{job.title}</h3>
            <span className={`stat-badge flex-shrink-0 flex items-center gap-1 ${
              job.matchScore >= 80 ? 'bg-green-500/15 text-green-400' :
              job.matchScore >= 60 ? 'bg-yellow-500/15 text-yellow-400' :
              'bg-slate-700/50 text-slate-400'
            }`}>
              <Star size={11} />
              {job.matchScore}% match
            </span>
          </div>
          <p className="text-slate-400 text-sm mb-3 line-clamp-2">{job.description}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {job.requiredSkills?.slice(0, 5).map(s => (
              <span key={s} className="px-2 py-0.5 bg-white/5 text-slate-400 text-xs rounded border border-white/10">{s}</span>
            ))}
          </div>
          <div className="flex items-center gap-4 text-sm flex-wrap">
            <span className="text-sky-400 font-medium flex items-center gap-1">
              <DollarSign size={13} />{job.salaryRange}
            </span>
            {job.growth && (
              <span className="text-green-400 text-xs flex items-center gap-1">
                <TrendingUp size={12} />{job.growth}
              </span>
            )}
          </div>
          {job.companies?.length > 0 && (
            <p className="text-slate-600 text-xs mt-2 flex items-center gap-1">
              <Building2 size={11} /> Hiring: {job.companies.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function JobRecommendationsPage() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [basedOn, setBasedOn] = useState('');
  const [skills, setSkills] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await jobAPI.getRecommendations();
        setJobs(data.jobs || []);
        setBasedOn(data.basedOn || '');
        setSkills(data.skills || []);
      } catch (err) {
        if (err.response?.status === 404) {
          toast('Upload a resume first to get job recommendations', { icon: '💡' });
        } else {
          toast.error('Failed to load recommendations');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = filter === 'all' ? jobs : jobs.filter(j =>
    filter === 'high' ? j.matchScore >= 80 :
    filter === 'medium' ? j.matchScore >= 60 && j.matchScore < 80 : j.matchScore < 60
  );

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-sky-500/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400">Loading job matches...</p>
      </div>
    </div>
  );

  if (jobs.length === 0) return (
    <div className="w-full px-6 py-20 text-center">
      <div className="card max-w-2xl mx-auto">
        <Briefcase size={56} className="text-slate-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-3">No Job Matches Yet</h2>
        <p className="text-slate-400 mb-6">Upload your resume first to get personalized job recommendations based on your skills.</p>
        <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
          <Upload size={16} /> Upload Resume <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Job <span className="gradient-text">Recommendations</span>
        </h1>
        {basedOn && (
          <p className="text-slate-400 text-sm flex items-center gap-2">
            <Briefcase size={13} className="text-sky-400" />
            Based on: <span className="text-sky-400">{basedOn}</span>
            <span className="text-slate-600">·</span>
            {jobs.length} matches found
          </p>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="card mb-6 w-full">
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-2">
            <Code2 size={14} /> Your skills used for matching:
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 15).map(s => (
              <span key={s} className="px-2.5 py-1 bg-sky-500/10 text-sky-400 text-xs rounded-lg border border-sky-500/20">{s}</span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <Filter size={16} className="text-slate-500 self-center flex-shrink-0" />
        {[
          { id: 'all', label: `All (${jobs.length})` },
          { id: 'high', label: `High Match (${jobs.filter(j => j.matchScore >= 80).length})` },
          { id: 'medium', label: `Medium (${jobs.filter(j => j.matchScore >= 60 && j.matchScore < 80).length})` },
          { id: 'low', label: `Explore (${jobs.filter(j => j.matchScore < 60).length})` },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              filter === f.id ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' : 'glass text-slate-400 hover:text-white'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Job Cards — full width */}
      <div className="space-y-4 stagger w-full">
        {filteredJobs.map((job, i) => (
          <JobCard key={i} job={job} index={i} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No jobs in this category. Try a different filter.
        </div>
      )}

      {/* Refresh CTA */}
      <div className="mt-10 card text-center border border-sky-500/20 w-full">
        <p className="text-slate-400 mb-4 flex items-center justify-center gap-2">
          <RefreshCw size={15} /> Want fresher matches? Upload your updated resume!
        </p>
        <Link to="/upload" className="btn-primary inline-flex items-center gap-2">
          <Upload size={16} /> Upload New Resume <ChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}