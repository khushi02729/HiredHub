import { Link } from 'react-router-dom';
import { Briefcase, CalendarClock, PlusCircle, Trophy, Users } from 'lucide-react';
import KpiCard from '../../components/dashboard/KpiCard';
import { HorizontalBars, StatusDoughnut, TrendLine } from '../../components/dashboard/charts';
import Avatar from '../../components/common/Avatar';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getRecruiterAnalytics } from '../../services/recruiterService';
import { formatDate } from '../../utils/format';

const Panel = ({ title, hint, action, children, className = '' }) => (
  <section className={`card p-5 ${className}`}>
    <div className="mb-4 flex items-start justify-between gap-3">
      <div><h2 className="font-bold">{title}</h2>{hint && <p className="text-xs text-slate-500">{hint}</p>}</div>
      {action}
    </div>
    {children}
  </section>
);

export default function RecruiterOverview() {
  useDocumentTitle('Recruiter overview');
  const { user } = useAuth();
  const { data: a, loading, error, reload } = useFetch(getRecruiterAnalytics, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hello, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-slate-600">Hiring activity for {user.company?.name || 'your company'}.</p>
        </div>
        <Button to="/recruiter/jobs/new" icon={PlusCircle}>Post a job</Button>
      </div>

      {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-card" />)}</div>}
      {!loading && error && <div className="card"><EmptyState icon={Briefcase} title="We could not load your dashboard" description={error} action={{ label: 'Try again', onClick: reload, variant: 'secondary' }} /></div>}

      {a && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Briefcase} tone="indigo" label="Active jobs" value={a.overview.activeJobs} hint={`${a.overview.totalJobs} posted in total`} />
            <KpiCard icon={Users} tone="violet" label="Total applicants" value={a.overview.totalApplicants} hint={`${a.overview.shortlisted} shortlisted`} />
            <KpiCard icon={CalendarClock} tone="amber" label="Interviews scheduled" value={a.overview.interviews} />
            <KpiCard icon={Trophy} tone="emerald" label="Successful hires" value={a.overview.hires} hint="Candidates at the Offer stage" />
          </div>

          {a.overview.totalJobs === 0 ? (
            <div className="card"><EmptyState icon={Briefcase} title="Post your first job" description="Candidates can apply as soon as it is live, and you will see them here." action={{ label: 'Post a job', to: '/recruiter/jobs/new' }} /></div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Hiring pipeline"><StatusDoughnut byStatus={a.byStatus} noun="applicants" /></Panel>
                <Panel title="Applicants over time" hint="Per week, last 8 weeks"><TrendLine weeks={a.applicationsOverTime} label="Applicants" /></Panel>
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <Panel title="Jobs with the most applicants"><HorizontalBars items={a.topJobs} labelKey="title" /></Panel>
                <Panel title="Latest applicants" action={<Link to="/recruiter/jobs" className="text-sm font-semibold text-primary-700 hover:underline">All jobs</Link>}>
                  {a.recentApplications.length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No applications yet.</p> : (
                    <ul className="divide-y divide-slate-100">
                      {a.recentApplications.map((r) => (
                        <li key={r._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                          <Avatar user={r.applicant} size={38} />
                          <div className="min-w-0 flex-1">
                            <Link to={`/recruiter/jobs/${r.job._id}/applicants`} className="block truncate text-sm font-bold hover:text-primary-700">{r.applicant.name}</Link>
                            <p className="truncate text-xs text-slate-500">{r.job.title}, {formatDate(r.createdAt)}</p>
                          </div>
                          <StatusBadge status={r.status} />
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
