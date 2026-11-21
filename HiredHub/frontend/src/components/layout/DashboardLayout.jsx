import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BarChart3, Bookmark, Briefcase, Building2, FileText, LayoutDashboard, ListChecks, LogOut,
  Menu, PlusCircle, Search, Settings, User, X,
} from 'lucide-react';
import Logo from '../common/Logo';
import Avatar from '../common/Avatar';
import useAuth from '../../hooks/useAuth';

const NAV = {
  seeker: [
    { label: 'Overview', to: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'Find Jobs', to: '/dashboard/jobs', icon: Search },
    { label: 'My Applications', to: '/dashboard/applications', icon: ListChecks },
    { label: 'Saved Jobs', to: '/dashboard/saved', icon: Bookmark },
    { label: 'Analytics', to: '/dashboard/analytics', icon: BarChart3 },
    { label: 'Resume', to: '/dashboard/resume', icon: FileText },
    { label: 'Profile', to: '/dashboard/profile', icon: User },
    { label: 'Settings', to: '/dashboard/settings', icon: Settings },
  ],
  recruiter: [
    { label: 'Overview', to: '/recruiter', icon: LayoutDashboard, end: true },
    { label: 'My Jobs', to: '/recruiter/jobs', icon: Briefcase, end: true },
    { label: 'Post a Job', to: '/recruiter/jobs/new', icon: PlusCircle },
    { label: 'Company Profile', to: '/recruiter/profile', icon: Building2 },
    { label: 'Settings', to: '/recruiter/settings', icon: Settings },
  ],
};

function SidebarContent({ items, user, onLogout }) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-4 pt-5"><Link to="/" aria-label="HiredHub home"><Logo /></Link></div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2" aria-label="Dashboard">
        {items.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            className={({ isActive }) => `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-100 hover:text-ink'}`}>
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute -left-3 top-2 h-6 w-1 rounded-r-full bg-primary-600" />}
                <Icon size={19} className={isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'} />
                {label}
              </>
            )}
          </NavLink>
        ))}
        <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700">
          <LogOut size={19} className="text-slate-400" />Logout
        </button>
      </nav>
      <div className="m-3 flex items-center gap-3 rounded-2xl border border-slate-200 bg-surface p-3">
        <Avatar user={user} size={38} />
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{user.name}</p>
          <p className="truncate text-xs text-slate-500">{user.role === 'seeker' ? 'Job seeker' : 'Recruiter'}</p>
        </div>
      </div>
    </div>
  );
}

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const onLogout = () => { logout(); navigate('/'); };
  const content = <SidebarContent items={NAV[role]} user={user} onLogout={onLogout} />;

  return (
    <div className="min-h-screen bg-surface">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 bg-white lg:block">{content}</aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} aria-label="Open menu" className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"><Menu size={22} /></button>
        <Logo />
        <Avatar user={user} size={32} />
      </header>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div className="absolute inset-0 bg-ink/50" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="absolute inset-y-0 left-0 w-72 bg-white shadow-lift" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'tween', duration: 0.22 }}>
              <button onClick={() => setOpen(false)} aria-label="Close menu" className="absolute right-3 top-4 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X size={20} /></button>
              {content}
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8"><Outlet /></div>
      </main>
    </div>
  );
}
