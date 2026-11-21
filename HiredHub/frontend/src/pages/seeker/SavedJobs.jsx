import { useState } from 'react';
import { Bookmark } from 'lucide-react';
import JobCard from '../../components/jobs/JobCard';
import ApplyModal from '../../components/applications/ApplyModal';
import EmptyState from '../../components/common/EmptyState';
import { JobCardSkeleton } from '../../components/common/Skeleton';
import useFetch from '../../hooks/useFetch';
import useToggleSave from '../../hooks/useToggleSave';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getSavedJobs } from '../../services/seekerService';

export default function SavedJobs() {
  useDocumentTitle('Saved jobs');
  const state = useFetch(getSavedJobs, []);
  const [applyJob, setApplyJob] = useState(null);
  const toggleSave = useToggleSave((fn) => state.setData(fn), { removeOnUnsave: true });
  const jobs = state.data || [];
  const markApplied = () => state.setData((list) => list.map((j) => (j._id === applyJob._id ? { ...j, hasApplied: true } : j)));

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Saved jobs</h1>
      <p className="mt-1 text-slate-600">{state.data ? `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} saved for later` : 'Loading your saved jobs'}</p>

      <div className="mt-6">
        {state.loading && <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 3 }, (_, i) => <JobCardSkeleton key={i} />)}</div>}
        {!state.loading && state.error && <div className="card"><EmptyState icon={Bookmark} title="We could not load your saved jobs" description={state.error} action={{ label: 'Try again', onClick: state.reload, variant: 'secondary' }} /></div>}
        {!state.loading && !state.error && jobs.length === 0 && (
          <div className="card"><EmptyState icon={Bookmark} title="Nothing saved yet" description="Tap the bookmark on any job to keep it here. You can apply straight from this page." action={{ label: 'Find jobs', to: '/dashboard/jobs' }} /></div>
        )}
        {!state.loading && jobs.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {jobs.map((job) => <JobCard key={job._id} job={job} basePath="/dashboard/jobs" onToggleSave={toggleSave} onApply={setApplyJob} />)}
          </div>
        )}
      </div>
      {applyJob && <ApplyModal job={applyJob} open onClose={() => setApplyJob(null)} onApplied={markApplied} />}
    </div>
  );
}
