import { BarChart3, FileText, Users } from 'lucide-react';
import StatusBadge from '../../../components/common/StatusBadge';

const BREAKDOWN = [
  ['Skills', 56, 70, 'bg-primary-600'],
  ['Experience', 15, 15, 'bg-violet-500'],
  ['Location', 11, 15, 'bg-emerald-500'],
];
const SMALL = [
  { icon: FileText, title: 'Resume library', text: 'Keep up to ten resumes, pick one per application, and preview or download any of them.' },
  { icon: BarChart3, title: 'Analytics that explain', text: 'See your interview and offer rates, weekly activity and the categories you apply to most.' },
  { icon: Users, title: 'A workspace for recruiters', text: 'Post jobs, review candidates with their match scores, shortlist, and move them through the pipeline.' },
];

export default function Features() {
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <h2 className="max-w-xl text-3xl font-extrabold tracking-tight">Everything you need to run a job search</h2>
      <div className="mt-10 grid gap-5 lg:grid-cols-3">
        <article className="card p-7 lg:col-span-2">
          <h3 className="text-xl font-bold">Match scores you can read</h3>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
            No black box. Each score is 70 points for skills, 15 for experience and 15 for location, and every job shows exactly where the points came from.
          </p>
          <div className="mt-6 rounded-2xl bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-semibold">Example: Frontend Engineer</p>
              <p className="text-2xl font-extrabold text-primary-700">82% match</p>
            </div>
            <div className="mt-4 space-y-3">
              {BREAKDOWN.map(([label, got, max, color]) => (
                <div key={label}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-slate-600"><span>{label}</span><span>{got} of {max}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200"><div className={`h-full rounded-full ${color}`} style={{ width: `${(got / max) * 100}%` }} /></div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-slate-500">Missing: Tailwind CSS, REST APIs</p>
          </div>
        </article>

        <article className="card p-7">
          <h3 className="text-xl font-bold">A tracker built for your pipeline</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">Drag applications between stages on a board, or switch to the list view. Every change is saved and logged.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Applied', 'Assessment', 'Interview', 'Offer', 'Rejected'].map((s) => <StatusBadge key={s} status={s} />)}
          </div>
        </article>

        {SMALL.map(({ icon: Icon, title, text }) => (
          <article key={title} className="card p-6">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600"><Icon size={20} /></div>
            <h3 className="mt-4 font-bold">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
