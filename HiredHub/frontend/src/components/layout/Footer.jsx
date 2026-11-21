import { Link } from 'react-router-dom';
import Logo from '../common/Logo';

const COLUMNS = [
  { title: 'Job seekers', links: [['Find jobs', '/jobs'], ['Create an account', '/register'], ['Log in', '/login']] },
  { title: 'Recruiters', links: [['Post a job', '/register?role=recruiter'], ['Recruiter log in', '/login?role=recruiter']] },
  { title: 'Product', links: [['How it works', '/#how-it-works'], ['Features', '/#features']] },
];

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_repeat(3,1fr)] lg:px-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
            Find the right role, keep every application in one place, and always know what happens next.
          </p>
        </div>
        {COLUMNS.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-bold text-ink">{c.title}</h4>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-sm text-slate-500 transition hover:text-primary-700">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 py-5 text-center text-xs text-slate-400">© {new Date().getFullYear()} HiredHub. All rights reserved.</div>
    </footer>
  );
}
