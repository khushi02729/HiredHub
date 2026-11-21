import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase, Pencil, PlusCircle, Trash2, Users } from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { deleteJob, getMyJobs, updateJob } from '../../services/recruiterService';
import { formatDate, formatSalary } from '../../utils/format';

export default function MyJobs() {
  useDocumentTitle('My jobs');
  const state = useFetch(getMyJobs, []);
  const jobs = state.data || [];
  const [target, setTarget] = useState(null);
  const [busyId, setBusyId] = useState('');

  const toggleStatus = async (job) => {
    const status = job.status === 'active' ? 'closed' : 'active';
    setBusyId(job._id);
    try {
      await updateJob(job._id, { status });
      state.setData((l) => l.map((j) => (j._id === job._id ? { ...j, status } : j)));
      toast.success(status === 'active' ? 'Job reopened' : 'Job closed to new applications');
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusyId(''); }
  };

  const remove = async () => {
    setBusyId(target._id);
    try {
      await deleteJob(target._id);
      state.setData((l) => l.filter((j) => j._id !== target._id));
      toast.success('Job deleted');
      setTarget(null);
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusyId(''); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My jobs</h1>
          <p className="mt-1 text-slate-600">{state.data ? `${jobs.length} ${jobs.length === 1 ? 'job' : 'jobs'} posted` : 'Loading your jobs'}</p>
        </div>
        <Button to="/recruiter/jobs/new" icon={PlusCircle}>Post a job</Button>
      </div>

      <div className="mt-6">
        {state.loading && <div className="space-y-3">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-20 rounded-card" />)}</div>}
        {!state.loading && state.error && <div className="card"><EmptyState icon={Briefcase} title="We could not load your jobs" description={state.error} action={{ label: 'Try again', onClick: state.reload, variant: 'secondary' }} /></div>}
        {!state.loading && !state.error && jobs.length === 0 && <div className="card"><EmptyState icon={Briefcase} title="You have not posted any jobs" description="Post a role to start receiving applications." action={{ label: 'Post a job', to: '/recruiter/jobs/new' }} /></div>}

        {jobs.length > 0 && (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-[44rem] text-left text-sm">
              <thead className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Applicants</th><th className="px-4 py-3">Posted</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {jobs.map((j) => (
                  <tr key={j._id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <Link to={`/jobs/${j._id}`} className="font-bold hover:text-primary-700">{j.title}</Link>
                      <p className="text-xs text-slate-500">{j.location}, {j.workMode}, {formatSalary(j.salary)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${j.status === 'active' ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : 'bg-slate-100 text-slate-600 ring-slate-200'}`}>{j.status === 'active' ? 'Active' : 'Closed'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/recruiter/jobs/${j._id}/applicants`} className="inline-flex items-center gap-1.5 font-semibold text-primary-700 hover:underline"><Users size={15} />{j.applicantCount}</Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(j.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button to={`/recruiter/jobs/${j._id}/applicants`} size="sm" variant="soft">Applicants</Button>
                        <Button to={`/recruiter/jobs/${j._id}/edit`} size="sm" variant="ghost" icon={Pencil}>Edit</Button>
                        <Button size="sm" variant="ghost" loading={busyId === j._id} onClick={() => toggleStatus(j)}>{j.status === 'active' ? 'Close' : 'Reopen'}</Button>
                        <button onClick={() => setTarget(j)} aria-label={`Delete ${j.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog open={!!target} busy={busyId === target?._id} onClose={() => setTarget(null)} onConfirm={remove} title="Delete this job?"
        message={target ? `${target.title} and its ${target.applicantCount} ${target.applicantCount === 1 ? 'application' : 'applications'} will be removed permanently. To stop new applications but keep the data, close the job instead.` : ''} />
    </div>
  );
}
