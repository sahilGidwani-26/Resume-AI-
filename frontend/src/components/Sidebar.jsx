import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Upload, Briefcase, FileText,
  Map, Target, Mic, LogOut, ChevronLeft, ChevronRight,
  StickyNote, Menu,
} from 'lucide-react';

const navLinks = [
  { label: 'Dashboard',      path: '/dashboard',      icon: LayoutDashboard },
  { label: 'Upload Resume',  path: '/upload',          icon: Upload },
  { label: 'Job Matches',    path: '/jobs',            icon: Briefcase },
  { label: 'Resume Builder', path: '/builder',         icon: FileText },
  { label: 'Roadmap',        path: '/roadmap',         icon: Map },
  { label: 'Interview Prep', path: '/interview',       icon: Target },
  { label: 'Mock Interview', path: '/mock-interview',  icon: Mic },
];

function NavItem({ label, path, icon: Icon, collapsed }) {
  const location = useLocation();
  const active = location.pathname === path;
  return (
    <Link
      to={path}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 mb-0.5 text-sm font-medium overflow-hidden
        ${active
          ? 'bg-sky-500/15 border-sky-500/25 text-sky-400'
          : 'border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
        }`}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="flex-1 whitespace-nowrap">{label}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const initials = user?.name?.charAt(0)?.toUpperCase() ?? 'U';
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex flex-col h-full bg-[#0d1424] border-r border-white/[0.07]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/[0.07] min-h-[64px]">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-sky-500/20">
          R
        </div>
        {!collapsed && (
          <span className="font-bold text-white text-[15px] tracking-tight whitespace-nowrap">
            Resume<span className="text-sky-400">AI</span>
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-bold tracking-[0.12em] text-slate-600 px-2 pb-2 pt-1 uppercase">
            Menu
          </p>
        )}
        {collapsed && <div className="h-3" />}

        {navLinks.map(l => (
          <NavItem key={l.path} {...l} collapsed={collapsed} />
        ))}

        <div className={collapsed ? 'mt-3 pt-3 border-t border-white/[0.05]' : 'mt-4'}>
          {!collapsed && (
            <p className="text-[10px] font-bold tracking-[0.12em] text-slate-600 px-2 pb-2 uppercase">
              Tools
            </p>
          )}
          <Link
            to="/notes"
            title={collapsed ? 'Notes & Todos' : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-sm font-medium overflow-hidden
              ${location.pathname === '/notes'
                ? 'bg-sky-500/15 border-sky-500/25 text-sky-400'
                : 'border-transparent text-slate-400 hover:bg-white/[0.06] hover:text-slate-200'
              }`}
          >
            <StickyNote size={18} className="shrink-0" />
            {!collapsed && <span className="whitespace-nowrap">Notes & Todos</span>}
          </Link>
        </div>
      </nav>

      {/* Bottom section */}
      <div className="px-2 pb-3 pt-2 border-t border-white/[0.07] space-y-1">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign Out' : undefined}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl border border-transparent text-sm font-medium text-red-400 hover:bg-red-500/[0.08] hover:border-red-500/10 transition-all overflow-hidden"
        >
          <LogOut size={18} className="shrink-0" />
          {!collapsed && <span className="whitespace-nowrap">Sign Out</span>}
        </button>

        <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] overflow-hidden ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(o => !o)}
        className="md:hidden fixed top-3 left-3 z-[300] w-10 h-10 rounded-xl bg-[#0d1424] border border-white/10 text-slate-400 flex items-center justify-center shadow-xl"
      >
        <Menu size={18} />
      </button>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[150]"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={`hidden md:block fixed top-0 left-0 bottom-0 z-[100] transition-all duration-300 ease-in-out
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}`}
      >
        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="absolute top-5 -right-3.5 w-7 h-7 rounded-full bg-[#0d1424] border border-white/10 text-slate-500 hover:text-sky-400 hover:border-sky-500/40 flex items-center justify-center z-10 shadow-lg transition-all duration-200"
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* ── MOBILE DRAWER ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 w-[240px] z-[200] transition-transform duration-300
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <SidebarContent collapsed={false} />
      </aside>
    </>
  );
}