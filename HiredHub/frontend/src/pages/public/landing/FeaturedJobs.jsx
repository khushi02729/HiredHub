import { Link } from 'react-router-dom';
import { Briefcase } from 'lucide-react';
import JobCard from '../../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../../components/common/Skeleton';
import EmptyState from '../../../components/common/EmptyState';
import useFetch from '../../../hooks/useFetch';
import useToggleSave from '../../../hooks/useToggleSave';
import { getJobs } from '../../../services/jobService';

export default function FeaturedJobs() {
  const { data, loading, error, setData } = useFetch(() => getJobs({ limit: 6, sort: 'newest' }), []);
  const toggleSave = useToggleSave((fn) => setData((d) => ({ ...d, jobs: fn(d.jobs) })));
  const jobs = data?.jobs || [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight">Newly posted jobs</h2>
          <p className="mt-2 text-slate-600">Fresh roles from companies that are hiring right now.</p>
        </div>
        <Link to="/jobs" className="text-sm font-semibold text-primary-700 hover:underline">Browse all jobs</Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading && Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)}
        {!loading && jobs.map((job) => <JobCard key={job._id} job={job} onToggleSave={toggleSave} />)}
      </div>
      {!loading && error && <div className="card mt-8"><EmptyState icon={Briefcase} title="Jobs are unavailable right now" description={error} /></div>}
      {!loading && !error && jobs.length === 0 && <div className="card mt-8"><EmptyState icon={Briefcase} title="No jobs posted yet" description="Check back soon, or create a recruiter account to post the first role." /></div>}
    </section>
  );
}
