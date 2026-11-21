import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import Logo from '../../components/common/Logo';

const COPY = {
  seeker: {
    heading: 'Every application, one clear view.',
    points: ['Match scores that show exactly why a job fits', 'A board for every stage from Applied to Offer', 'Resumes and cover letters kept in one place'],
  },
  recruiter: {
    heading: 'Hire from a shortlist you can trust.',
    points: ['Post jobs and manage your own pipeline', 'See each candidate’s match score beside their resume', 'Shortlist, interview and decide from one screen'],
  },
};

export default function AuthLayout({ role, title, subtitle, children }) {
  const copy = COPY[role];
  return (
    <div className="grid min-h-screen lg:grid-cols-[5fr_6fr]">
      <aside className="relative hidden overflow-hidden bg-brand p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10" />
        <div aria-hidden="true" className="absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-white/10" />
        <Link to="/" className="relative" aria-label="HiredHub home"><Logo light /></Link>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">{copy.heading}</h2>
          <ul className="mt-8 space-y-4">
            {copy.points.map((p) => (
              <li key={p} className="flex items-start gap-3 text-white/90"><CheckCircle2 size={20} className="mt-0.5 shrink-0 text-white" />{p}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-white/60">© {new Date().getFullYear()} HiredHub</p>
      </aside>
      <main className="flex items-center justify-center px-5 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-8 inline-block lg:hidden" aria-label="HiredHub home"><Logo /></Link>
          <h1 className="text-3xl font-extrabold tracking-tight">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
