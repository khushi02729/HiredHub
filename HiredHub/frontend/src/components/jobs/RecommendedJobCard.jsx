import { Link } from 'react-router-dom';
import { Bookmark } from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo';
import MatchRing from './MatchRing';
import { formatSalary } from '../../utils/format';

export default function RecommendedJobCard({ job, basePath = '/dashboard/jobs', onToggleSave }) {
  const { match } = job;
  return (
    <article className="card relative flex flex-col p-4 transition hover:border-primary-200 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company?.name} logo={job.company?.logo} size={40} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-sm font-bold">
            <Link to={`${basePath}/${job._id}`} className="after:absolute after:inset-0 hover:text-primary-700">{job.title}</Link>
          </h3>
          <p className="truncate text-xs text-slate-500">{job.company?.name}, {job.location}</p>
        </div>
        <MatchRing value={match.matchPercent} size={46} />
      </div>
      <p className="mt-3 text-sm font-semibold">{formatSalary(job.salary)}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {match.matchingSkills.slice(0, 3).map((s) => <span key={s} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">{s}</span>)}
        {match.missingSkills.slice(0, 2).map((s) => <span key={s} className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">Missing {s}</span>)}
      </div>
      {onToggleSave && (
        <button onClick={() => onToggleSave(job)} aria-label={job.isSaved ? 'Remove from saved jobs' : 'Save job'} aria-pressed={!!job.isSaved}
          className="relative z-10 mt-3 inline-flex items-center gap-1.5 self-start rounded-lg px-1 py-1 text-xs font-semibold text-slate-500 hover:text-primary-700">
          <Bookmark size={14} className={job.isSaved ? 'fill-primary-600 text-primary-600' : ''} />{job.isSaved ? 'Saved' : 'Save'}
        </button>
      )}
    </article>
  );
}
