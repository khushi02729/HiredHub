import { CheckCircle2, CircleDashed } from 'lucide-react';
import MatchRing from './MatchRing';

const ROWS = [['skills', 'Skills'], ['experience', 'Experience'], ['location', 'Location']];

// Shows exactly where a match score comes from, using the weights the API reports.
export default function MatchCard({ match }) {
  if (!match) return null;
  const w = match.weights;
  return (
    <section className="card p-5" aria-label="Your match">
      <div className="flex items-center gap-4">
        <MatchRing value={match.matchPercent} size={84} />
        <div>
          <h3 className="font-bold">Your match</h3>
          <p className="text-sm text-slate-500">Based on your profile</p>
        </div>
      </div>
      <div className="mt-5 space-y-3">
        {ROWS.map(([key, label]) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs font-medium text-slate-600"><span>{label}</span><span>{match.breakdown[key]} of {w[key]}</span></div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-brand" style={{ width: `${(match.breakdown[key] / w[key]) * 100}%` }} /></div>
          </div>
        ))}
      </div>
      {match.matchingSkills.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-700"><CheckCircle2 size={14} />You have</p>
          <div className="flex flex-wrap gap-1.5">{match.matchingSkills.map((s) => <span key={s} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{s}</span>)}</div>
        </div>
      )}
      {match.missingSkills.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-amber-700"><CircleDashed size={14} />Missing</p>
          <div className="flex flex-wrap gap-1.5">{match.missingSkills.map((s) => <span key={s} className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">{s}</span>)}</div>
        </div>
      )}
    </section>
  );
}
