import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Star, Users, XCircle } from 'lucide-react';
import CandidateModal from '../../components/applications/CandidateModal';
import StatusSelect from '../../components/applications/StatusSelect';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import MatchRing from '../../components/jobs/MatchRing';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { getApplicants, setShortlisted, updateApplicationStatus } from '../../services/applicationService';
import { STATUSES } from '../../utils/constants';
import { formatDate } from '../../utils/format';

export default function Applicants() {
  const { jobId } = useParams();
  const state = useFetch(() => getApplicants(jobId), [jobId]);
  const { job, applicants = [] } = state.data || {};
  useDocumentTitle(job ? `Applicants for ${job.title}` : 'Applicants');
  const [filter, setFilter] = useState('All');
  const [q, setQ] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [busyId, setBusyId] = useState('');

  // Keep the match score from the list; API responses for a single application do not include it
  const replace = (u) => state.setData((d) => ({ ...d, applicants: d.applicants.map((a) => (a._id === u._id ? { ...a, ...u, match: a.match } : a)) }));
  const run = async (id, fn, success) => {
    setBusyId(id);
    try { replace(await fn()); toast.success(success); return true; } catch (err) { toast.error(errorMessage(err)); return false; } finally { setBusyId(''); }
  };
  const changeStatus = (a, status) => run(a._id, () => updateApplicationStatus(a._id, { status }), `Moved ${a.applicant.name} to ${status}`);
  const toggleShortlist = (a) => run(a._id, () => setShortlisted(a._id, !a.shortlisted), a.shortlisted ? 'Removed from shortlist' : 'Shortlisted');
  const reject = async () => { if (await changeStatus(rejectTarget, 'Rejected')) setRejectTarget(null); };

  const shown = applicants.filter((a) => (filter === 'All' || (filter === 'Shortlisted' ? a.shortlisted : a.status === filter))
    && (!q.trim() || a.applicant.name.toLowerCase().includes(q.trim().toLowerCase())));
  const count = (f) => (f === 'All' ? applicants.length : f === 'Shortlisted' ? applicants.filter((a) => a.shortlisted).length : applicants.filter((a) => a.status === f).length);
  const selected = applicants.find((a) => a._id === selectedId);

  return (
    <div>
      <Link to="/recruiter/jobs" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary-700"><ArrowLeft size={16} />Back to my jobs</Link>
      <h1 className="text-2xl font-extrabold tracking-tight">{job ? job.title : 'Applicants'}</h1>
      <p className="mt-1 text-slate-600">{state.data ? `${applicants.length} ${applicants.length === 1 ? 'applicant' : 'applicants'}, best matches listed within each stage` : 'Loading applicants'}</p>

      <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter applicants">
          {['All', 'Shortlisted', ...STATUSES].map((f) => (
            <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${filter === f ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'}`}>
              {f}<span className="ml-1.5 opacity-70">{count(f)}</span>
            </button>
          ))}
        </div>
        <label className="relative lg:w-64">
          <span className="sr-only">Search applicants</span>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name" />
        </label>
      </div>

      <div className="mt-6 space-y-3">
        {state.loading && Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}
        {!state.loading && state.error && <div className="card"><EmptyState icon={Users} title="We could not load applicants" description={state.error} action={{ label: 'Try again', onClick: state.reload, variant: 'secondary' }} /></div>}
        {state.data && applicants.length === 0 && <div className="card"><EmptyState icon={Users} title="No applicants yet" description="When candidates apply, they appear here with a match score and their resume." /></div>}
        {state.data && applicants.length > 0 && shown.length === 0 && <div className="card"><EmptyState icon={Search} title="No candidates match" description="Try another stage or search term." action={{ label: 'Reset filters', onClick: () => { setFilter('All'); setQ(''); }, variant: 'secondary' }} /></div>}

        {shown.map((a) => (
          <article key={a._id} className="card flex flex-wrap items-center gap-4 p-4">
            <Avatar user={a.applicant} size={46} />
            <div className="min-w-0 flex-1 basis-48">
              <button onClick={() => setSelectedId(a._id)} className="block max-w-full truncate text-left font-bold hover:text-primary-700">{a.applicant.name}</button>
              <p className="truncate text-xs text-slate-500">{a.applicant.headline || a.applicant.email}, applied {formatDate(a.createdAt)}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {a.match.matchingSkills.slice(0, 4).map((s) => <span key={s} className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">{s}</span>)}
                {a.match.missingSkills.length > 0 && <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-700">{a.match.missingSkills.length} missing</span>}
              </div>
            </div>
            <MatchRing value={a.match.matchPercent} size={52} />
            <div className="flex flex-wrap items-center gap-2">
              <StatusSelect value={a.status} onChange={(s) => changeStatus(a, s)} disabled={busyId === a._id} />
              <button onClick={() => toggleShortlist(a)} disabled={busyId === a._id} aria-pressed={a.shortlisted} aria-label={a.shortlisted ? 'Remove from shortlist' : 'Shortlist candidate'}
                className={`rounded-lg p-2 transition ${a.shortlisted ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:bg-slate-100 hover:text-amber-600'}`}><Star size={18} className={a.shortlisted ? 'fill-amber-400' : ''} /></button>
              {a.status !== 'Rejected' && <Button size="sm" variant="ghost" icon={XCircle} className="text-rose-600 hover:bg-rose-50" onClick={() => setRejectTarget(a)}>Reject</Button>}
              <Button size="sm" variant="soft" onClick={() => setSelectedId(a._id)}>View profile</Button>
            </div>
          </article>
        ))}
      </div>

      {selected && <CandidateModal key={selected._id} application={selected} onClose={() => setSelectedId(null)} onChange={replace} />}
      <ConfirmDialog open={!!rejectTarget} busy={busyId === rejectTarget?._id} onClose={() => setRejectTarget(null)} onConfirm={reject} confirmLabel="Reject candidate" title="Reject this candidate?"
        message={rejectTarget ? `${rejectTarget.applicant.name} will be moved to Rejected and removed from your shortlist. You can move them back at any time.` : ''} />
    </div>
  );
}
