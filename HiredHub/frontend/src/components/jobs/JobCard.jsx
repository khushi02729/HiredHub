import { Link } from 'react-router-dom';
import { Bookmark, Briefcase, Clock, MapPin, Wallet } from 'lucide-react';
import CompanyLogo from '../common/CompanyLogo';
import Button from '../common/Button';
import { experienceLabel, formatSalary, timeAgo } from '../../utils/format';

export default function JobCard({ job, onToggleSave, onApply, basePath = '/jobs' }) {
  const skills = job.skills || [];
  return (
    <article className="card group flex flex-col p-5 transition duration-200 hover:border-primary-200 hover:shadow-lift">
      <div className="flex items-start gap-3">
        <CompanyLogo name={job.company?.name} logo={job.company?.logo} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-bold">
            <Link to={`${basePath}/${job._id}`} className="hover:text-primary-700">{job.title}</Link>
          </h3>
          <p className="truncate text-sm text-slate-500">{job.company?.name}</p>
        </div>
        {onToggleSave && (
          <button
            onClick={() => onToggleSave(job)}
            aria-label={job.isSaved ? 'Remove from saved jobs' : 'Save job'}
            aria-pressed={!!job.isSaved}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-primary-50 hover:text-primary-600"
          >
            <Bookmark size={18} className={job.isSaved ? 'fill-primary-600 text-primary-600' : ''} />
          </button>
        )}
      </div>

      <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
        <li className="inline-flex items-center gap-1.5"><MapPin size={14} className="text-slate-400" />{job.location}, {job.workMode}</li>
        <li className="inline-flex items-center gap-1.5"><Briefcase size={14} className="text-slate-400" />{job.employmentType}</li>
        <li className="inline-flex items-center gap-1.5"><Clock size={14} className="text-slate-400" />{experienceLabel(job)}</li>
      </ul>

      <p className="mt-4 flex items-center gap-2 text-lg font-bold">
        <Wallet size={18} className="text-primary-600" />{formatSalary(job.salary)}
        <span className="text-xs font-medium text-slate-400">per year</span>
      </p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {skills.slice(0, 4).map((s) => <span key={s} className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">{s}</span>)}
        {skills.length > 4 && <span className="rounded-lg px-2 py-1 text-xs font-medium text-slate-400">+{skills.length - 4} more</span>}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-400">{timeAgo(job.createdAt)}</span>
        {job.hasApplied
          ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Applied</span>
          : (
            <div className="flex gap-2">
              <Button to={`${basePath}/${job._id}`} variant="soft" size="sm">View details</Button>
              {onApply && <Button size="sm" onClick={() => onApply(job)}>Apply now</Button>}
            </div>
          )}
      </div>
    </article>
  );
}
