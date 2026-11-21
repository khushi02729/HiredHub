import { Link } from 'react-router-dom';
import { Bookmark, CalendarClock, FileText, Gift, Search, Trophy, UserCog } from 'lucide-react';
import KpiCard from '../../components/dashboard/KpiCard';
import { ActivityBar, StatusDoughnut } from '../../components/dashboard/charts';
import RecommendedJobCard from '../../components/jobs/RecommendedJobCard';
import CompanyLogo from '../../components/common/CompanyLogo';
import StatusBadge from '../../components/common/StatusBadge';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import useAuth from '../../hooks/useAuth';
import useFetch from '../../hooks/useFetch';
import useToggleSave from '../../hooks/useToggleSave';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getRecommendations, getSeekerAnalytics } from '../../services/seekerService';
import { formatDate, formatDateTime } from '../../utils/format';

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

const Panel = ({ title, action, children, className = '' }) => (
  <section className={`card p-5 ${className}`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-bold">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);
const ViewAll = ({ to, children = 'View all' }) => <Link to={to} className="text-sm font-semibold text-primary-700 hover:underline">{children}</Link>;

function OverviewSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-card" />)}</div>
      <div className="grid gap-6 lg:grid-cols-2"><Skeleton className="h-72 rounded-card" /><Skeleton className="h-72 rounded-card" /></div>
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}

export default function Overview() {
  useDocumentTitle('Overview');
  const { user } = useAuth();
  const analytics = useFetch(getSeekerAnalytics, []);
  const recs = useFetch(() => getRecommendations(4), []);
  const toggleSave = useToggleSave((fn) => recs.setData((d) => ({ ...d, jobs: fn(d.jobs) })));
  const a = analytics.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{greeting()}, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-slate-600">Here is where your job search stands today.</p>
        </div>
        <Button to="/dashboard/jobs" icon={Search}>Find jobs</Button>
      </div>

      {analytics.loading && <OverviewSkeleton />}
      {!analytics.loading && analytics.error && (
        <div className="card"><EmptyState icon={FileText} title="We could not load your dashboard" description={analytics.error} action={{ label: 'Try again', onClick: analytics.reload, variant: 'secondary' }} /></div>
      )}

      {a && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={FileText} tone="indigo" label="Total applications" value={a.overview.totalApplications} />
            <KpiCard icon={CalendarClock} tone="violet" label="Interviews scheduled" value={a.overview.interviews} />
            <KpiCard icon={Gift} tone="emerald" label="Offers received" value={a.overview.offers} />
            <KpiCard icon={Bookmark} tone="amber" label="Saved jobs" value={a.overview.savedJobs} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Application status"><StatusDoughnut byStatus={a.byStatus} /></Panel>
            <Panel title="Activity this week"><ActivityBar days={a.weeklyActivity} /></Panel>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Panel title="Recent applications" action={<ViewAll to="/dashboard/applications" />} className="lg:col-span-2">
              {a.recentApplications.length === 0 ? (
                <EmptyState icon={FileText} title="No applications yet" description="Apply to your first job and it will show up here." action={{ label: 'Browse jobs', to: '/dashboard/jobs' }} className="py-8" />
              ) : (
                <ul className="divide-y divide-slate-100">
                  {a.recentApplications.map((app) => (
                    <li key={app._id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <CompanyLogo name={app.job.company.name} logo={app.job.company.logo} size={40} />
                      <div className="min-w-0 flex-1">
                        <Link to={`/dashboard/jobs/${app.job._id}`} className="block truncate text-sm font-bold hover:text-primary-700">{app.job.title}</Link>
                        <p className="truncate text-xs text-slate-500">{app.job.company.name}, applied {formatDate(app.createdAt)}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>

            <Panel title="Upcoming interviews">
              {a.upcomingInterviews.length === 0 ? (
                <p className="py-6 text-center text-sm text-slate-500">No interviews on the calendar. Add an interview date to an application to see it here.</p>
              ) : (
                <ul className="space-y-3">
                  {a.upcomingInterviews.map((i) => (
                    <li key={i._id} className="rounded-xl bg-violet-50 p-3">
                      <p className="truncate text-sm font-bold">{i.job.title}</p>
                      <p className="truncate text-xs text-slate-600">{i.job.company.name}</p>
                      <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700"><CalendarClock size={14} />{formatDateTime(i.interviewDate)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
          </div>
        </>
      )}

      <Panel title="Recommended for you" action={<ViewAll to="/dashboard/jobs">Browse all jobs</ViewAll>}>
        {!user.skills?.length && (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-primary-50 px-4 py-3 text-sm text-primary-800">
            <span className="inline-flex items-center gap-2"><UserCog size={18} />Add your skills to your profile to get more accurate matches.</span>
            <ViewAll to="/dashboard/profile">Update profile</ViewAll>
          </div>
        )}
        {recs.loading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-40 rounded-card" />)}</div>}
        {!recs.loading && recs.error && <p className="py-6 text-center text-sm text-slate-500">{recs.error}</p>}
        {!recs.loading && !recs.error && recs.data?.jobs.length === 0 && <EmptyState icon={Trophy} title="No matches yet" description="Once more jobs are posted, the best fits for your profile appear here." className="py-8" />}
        {recs.data?.jobs.length > 0 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {recs.data.jobs.map((job) => <RecommendedJobCard key={job._id} job={job} onToggleSave={toggleSave} />)}
            </div>
            <p className="mt-4 text-xs text-slate-400">Match score = {recs.data.weights.skills} points for skills, {recs.data.weights.experience} for experience and {recs.data.weights.location} for location.</p>
          </>
        )}
      </Panel>
    </div>
  );
}
