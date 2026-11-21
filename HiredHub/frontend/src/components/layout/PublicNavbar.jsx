import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from '../common/Logo';
import Button from '../common/Button';
import useAuth from '../../hooks/useAuth';
import { homeFor } from '../../utils/roles';

const LINKS = [
  { label: 'Find jobs', to: '/jobs' },
  { label: 'How it works', to: '/#how-it-works' },
  { label: 'Features', to: '/#features' },
  { label: 'Reviews', to: '/#reviews' },
];

export default function PublicNavbar() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const actions = user
    ? <Button to={homeFor(user.role)} size="sm">Go to dashboard</Button>
    : <>
        <Button to="/login" variant="ghost" size="sm">Log in</Button>
        <Button to="/register" size="sm">Get started</Button>
      </>;

  return (
    <header className={`sticky top-0 z-40 transition ${scrolled || open ? 'border-b border-slate-200/80 bg-white/85 backdrop-blur-lg' : 'border-b border-transparent'}`}>
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Link to="/" aria-label="HiredHub home"><Logo /></Link>
        <ul className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <li key={l.to}>
              <NavLink to={l.to} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-ink">{l.label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="hidden items-center gap-2 md:flex">{actions}</div>
        <button className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 md:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="space-y-1 border-t border-slate-100 bg-white px-4 pb-5 pt-3 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">{l.label}</Link>
          ))}
          <div className="flex gap-2 pt-3" onClick={() => setOpen(false)}>{actions}</div>
        </div>
      )}
    </header>
  );
}
