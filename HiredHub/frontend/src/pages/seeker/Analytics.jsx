import { BarChart3, CalendarClock, Send, TrendingUp, XCircle } from 'lucide-react';
import KpiCard from '../../components/dashboard/KpiCard';
import { ActivityBar, HorizontalBars, StatusDoughnut, TrendLine } from '../../components/dashboard/charts';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getSeekerAnalytics } from '../../services/seekerService';

const Panel = ({ title, hint, children }) => (
  <section className="card p-5">
    <h2 className="font-bold">{title}</h2>
    {hint && <p className="mb-4 text-xs text-slate-500">{hint}</p>}
    <div className={hint ? '' : 'mt-4'}>{children}</div>
  </section>
);

export default function Analytics() {
  useDocumentTitle('Analytics');
  const { data: a, loading, error, reload } = useFetch(getSeekerAnalytics, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Analytics</h1>
        <p className="mt-1 text-slate-600">See how your applications are converting.</p>
      </div>

      {loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-36 rounded-card" />)}</div>}
      {!loading && error && <div className="card"><EmptyState icon={BarChart3} title="We could not load analytics" description={error} action={{ label: 'Try again', onClick: reload, variant: 'secondary' }} /></div>}

      {a && a.overview.totalApplications === 0 && (
        <div className="card"><EmptyState icon={BarChart3} title="No data yet" description="Analytics appear after you send your first application." action={{ label: 'Find jobs', to: '/dashboard/jobs' }} /></div>
      )}

      {a && a.overview.totalApplications > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Send} tone="indigo" label="Applications sent" value={a.overview.totalApplications} />
            <KpiCard icon={CalendarClock} tone="violet" label="Interview conversion" value={`${a.rates.interviewRate}%`} hint="Applications that reached an interview" />
            <KpiCard icon={TrendingUp} tone="emerald" label="Offer conversion" value={`${a.rates.offerRate}%`} hint="Applications that led to an offer" />
            <KpiCard icon={XCircle} tone="amber" label="Rejected" value={a.overview.rejected} hint={`${a.rates.rejectionRate}% of applications`} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="Applications by status"><StatusDoughnut byStatus={a.byStatus} /></Panel>
            <Panel title="Applications over time" hint="Per week, last 8 weeks"><TrendLine weeks={a.applicationsOverTime} /></Panel>
            <Panel title="Weekly activity" hint="Applications sent and status changes, last 7 days"><ActivityBar days={a.weeklyActivity} /></Panel>
            <Panel title="Most applied categories"><HorizontalBars items={a.topCategories} labelKey="category" /></Panel>
          </div>
        </>
      )}
    </div>
  );
}
