import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, BarChart2, Eye, Plus, Loader2, TrendingUp } from 'lucide-react';
import { getPortfolioStats, getUserPortfolios } from '../utils/portfolio.service';

export default function PortfolioDashboardWidget() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getPortfolioStats(), getUserPortfolios()])
      .then(([statsRes, listRes]) => {
        if (statsRes.data.success)  setStats(statsRes.data.stats);
        if (listRes.data.success)   setRecent(listRes.data.portfolios.slice(0, 3));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 flex items-center justify-center min-h-[160px]">
      <Loader2 size={22} className="animate-spin text-sky-400" />
    </div>
  );

  return (
    <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 hover:border-white/[0.12] transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Globe size={16} className="text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Portfolio</h3>
            <p className="text-[10px] text-slate-600">Manage your online presence</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/portfolio')}
          className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-white">{stats.total}</p>
            <p className="text-[10px] text-slate-600">Portfolios</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-sky-400">{stats.totalViews}</p>
            <p className="text-[10px] text-slate-600">Total Views</p>
          </div>
          <div className="bg-white/[0.03] border border-white/[0.05] rounded-xl p-3 text-center">
            <p className={`text-lg font-bold ${stats.avgScore >= 80 ? 'text-emerald-400' : stats.avgScore >= 60 ? 'text-yellow-400' : stats.avgScore ? 'text-red-400' : 'text-slate-600'}`}>
              {stats.avgScore ?? '—'}
            </p>
            <p className="text-[10px] text-slate-600">Avg Score</p>
          </div>
        </div>
      )}

      {/* Recent portfolios */}
      {recent.length > 0 ? (
        <div className="space-y-2">
          {recent.map(p => (
            <div key={p._id}
              onClick={() => navigate('/portfolio')}
              className="flex items-center justify-between px-3 py-2 bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] rounded-xl cursor-pointer transition-all">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                  {p.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-300 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Eye size={9} /> {p.views || 0} views
                  </p>
                </div>
              </div>
              {p.analysisScore !== null && p.analysisScore !== undefined ? (
                <span className={`text-xs font-bold shrink-0 ${p.analysisScore >= 80 ? 'text-emerald-400' : p.analysisScore >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {p.analysisScore}/100
                </span>
              ) : (
                <span className="text-[10px] text-slate-600 shrink-0">Not analyzed</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <button
          onClick={() => navigate('/portfolio')}
          className="w-full flex items-center justify-center gap-2 py-3 border border-dashed border-white/[0.08] rounded-xl text-xs text-slate-600 hover:text-sky-400 hover:border-sky-500/20 transition-all"
        >
          <Plus size={13} /> Create your first portfolio
        </button>
      )}

      {/* CTA */}
      {stats && stats.total > 0 && (
        <button
          onClick={() => navigate('/portfolio')}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-sky-500/10 hover:bg-sky-500/15 border border-sky-500/15 text-sky-400 rounded-xl text-xs font-medium transition-all"
        >
          <BarChart2 size={13} /> Analyze Portfolio
        </button>
      )}
    </div>
  );
}