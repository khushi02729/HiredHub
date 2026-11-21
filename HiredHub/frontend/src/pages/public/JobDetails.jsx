import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Bookmark, Briefcase, CheckCircle2, Clock, ExternalLink, Globe, MapPin, Users } from 'lucide-react';
import CompanyLogo from '../../components/common/CompanyLogo';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import MatchCard from '../../components/jobs/MatchCard';
import ApplyModal from '../../components/applications/ApplyModal';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useToggleSave from '../../hooks/useToggleSave';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getJob } from '../../services/jobService';
import { getJobMatch } from '../../services/seekerService';
import { experienceLabel, formatSalary, timeAgo } from '../../utils/format';

const Section = ({ title, children }) => (
  <section className="card p-6">
    <h2 className="mb-3 text-lg font-bold">{title}</h2>
    {children}
  </section>
);

const Bullets = ({ items, check }) => (
  <ul className="space-y-2.5">
    {items.map((t) => (
      <li key={t} className="flex gap-3 text-sm leading-relaxed text-slate-700">
        {check ? <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" /> : <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />}
        {t}
      </li>
    ))}
  </ul>
);

function DetailsSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]" aria-busy="true">
      <div className="space-y-6"><Skeleton className="h-44 rounded-card" /><Skeleton className="h-56 rounded-card" /><Skeleton className="h-40 rounded-card" /></div>
      <div className="space-y-6"><Skeleton className="h-64 rounded-card" /><Skeleton className="h-40 rounded-card" /></div>
    </div>
  );
}

export default function JobDetails({ basePath = '/jobs', embedded = false }) {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [applyOpen, setApplyOpen] = useState(false);

  const jobState = useFetch(() => getJob(id), [id, user?.role]);
  const matchState = useFetch(() => (user?.role === 'seeker' ? getJobMatch(id) : Promise.resolve(null)), [id, user?.role]);
  const job = jobState.data;
  const match = matchState.data;
  useDocumentTitle(job ? `${job.title} at ${job.company.name}` : 'Job details');
  const toggleSave = useToggleSave((fn) => jobState.setData((j) => fn([j])[0]));

  const applicationsPath = '/dashboard/applications';
  const startApply = () => {
    if (!user) { toast('Sign in to apply'); navigate('/login', { state: { from: location.pathname } }); return; }
    setApplyOpen(true);
  };
  const markApplied = () => jobState.setData((j) => ({ ...j, hasApplied: true }));

  const skillTone = (skill) => {
    if (!match) return 'bg-slate-100 text-slate-700';
    return match.matchingSkills.includes(skill) ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200' : 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200';
  };

  const back = (
    <Link to={basePath} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary-700"><ArrowLeft size={16} />Back to jobs</Link>
  );

  let body;
  if (jobState.loading) body = <DetailsSkeleton />;
  else if (jobState.error || !job) {
    body = <div className="card"><EmptyState icon={Briefcase} title="We could not find this job" description={jobState.error || 'It may have been removed by the recruiter.'} action={{ label: 'Browse jobs', to: basePath }} /></div>;
  } else {
    const closed = job.status === 'closed';
    body = (
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <header className="card p-6">
            <div className="flex flex-wrap items-start gap-4">
              <CompanyLogo name={job.company.name} logo={job.company.logo} size={60} />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-extrabold tracking-tight">{job.title}</h1>
                <p className="mt-0.5 text-slate-600">{job.company.name}</p>
              </div>
              <p className="text-right"><span className="block text-2xl font-extrabold text-primary-700">{formatSalary(job.salary)}</span><span className="text-xs text-slate-400">per year</span></p>
            </div>
            <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
              <li className="inline-flex items-center gap-1.5"><MapPin size={16} className="text-slate-400" />{job.location}, {job.workMode}</li>
              <li className="inline-flex items-center gap-1.5"><Briefcase size={16} className="text-slate-400" />{job.employmentType}</li>
              <li className="inline-flex items-center gap-1.5"><Clock size={16} className="text-slate-400" />{experienceLabel(job)}</li>
              <li className="text-slate-400">{timeAgo(job.createdAt)}</li>
            </ul>
            {closed && <p className="mt-4 rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm font-medium text-amber-800">This job is closed and no longer accepts applications.</p>}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {user?.role === 'recruiter' ? (
                <p className="text-sm text-slate-500">Recruiter accounts cannot apply to jobs.</p>
              ) : job.hasApplied ? (
                <>
                  <Button variant="soft" icon={CheckCircle2} disabled>Applied</Button>
                  <Button to={applicationsPath} variant="secondary">View my applications</Button>
                </>
              ) : (
                <Button size="lg" onClick={startApply} disabled={closed}>Apply now</Button>
              )}
              {user?.role !== 'recruiter' && (
                <Button variant="secondary" size="lg" icon={Bookmark} onClick={() => toggleSave(job)} aria-pressed={!!job.isSaved} className={job.isSaved ? 'border-primary-300 text-primary-700' : ''}>
                  {job.isSaved ? 'Saved' : 'Save job'}
                </Button>
              )}
            </div>
          </header>

          <Section title="About the role"><p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{job.description}</p></Section>
          {job.responsibilities?.length > 0 && <Section title="Responsibilities"><Bullets items={job.responsibilities} /></Section>}
          {job.qualifications?.length > 0 && <Section title="Qualifications"><Bullets items={job.qualifications} /></Section>}
          <Section title="Required skills">
            <div className="flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${skillTone(s)}`}>{s}</span>)}</div>
            {match && <p className="mt-3 text-xs text-slate-500">Green skills are on your profile. Amber ones are not yet.</p>}
          </Section>
          {job.benefits?.length > 0 && <Section title="Benefits"><Bullets items={job.benefits} check /></Section>}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {user?.role === 'seeker' && <MatchCard match={match} />}
          <section className="card p-5">
            <h2 className="mb-4 font-bold">About the company</h2>
            <div className="flex items-center gap-3"><CompanyLogo name={job.company.name} logo={job.company.logo} size={40} /><p className="font-semibold">{job.company.name}</p></div>
            <ul className="mt-4 space-y-2.5 text-sm text-slate-600">
              {job.company.size && <li className="flex items-center gap-2"><Users size={16} className="text-slate-400" />{job.company.size} employees</li>}
              {job.company.website && <li className="flex items-center gap-2"><Globe size={16} className="text-slate-400" /><a href={job.company.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary-700 hover:underline">Website<ExternalLink size={13} /></a></li>}
            </ul>
          </section>
          {job.recruiter && (
            <section className="card p-5">
              <h2 className="mb-4 font-bold">Posted by</h2>
              <div className="flex items-center gap-3">
                <Avatar user={job.recruiter} size={44} />
                <div className="min-w-0"><p className="truncate font-semibold">{job.recruiter.name}</p><p className="truncate text-xs text-slate-500">{job.recruiter.headline || 'Recruiter'}</p></div>
              </div>
            </section>
          )}
        </aside>

        {applyOpen && <ApplyModal job={job} open={applyOpen} onClose={() => setApplyOpen(false)} onApplied={markApplied} />}
      </div>
    );
  }

  return <div className={embedded ? '' : 'mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'}>{back}{body}</div>;
}
