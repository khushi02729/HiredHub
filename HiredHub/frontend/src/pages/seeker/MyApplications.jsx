import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import { CalendarClock, FileText, LayoutGrid, List, Search, Trash2 } from 'lucide-react';
import ApplicationDetailModal from '../../components/applications/ApplicationDetailModal';
import StatusSelect from '../../components/applications/StatusSelect';
import CompanyLogo from '../../components/common/CompanyLogo';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Skeleton from '../../components/common/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { deleteApplication, getMyApplications, updateApplication, updateApplicationStatus } from '../../services/applicationService';
import { STATUSES, STATUS_COLORS } from '../../utils/constants';
import { formatDate, formatDateTime } from '../../utils/format';

export default function MyApplications() {
  useDocumentTitle('My applications');
  const state = useFetch(getMyApplications, []);
  const apps = state.data || [];
  const [view, setView] = useState('board');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedId, setSelectedId] = useState(null);
  const [datePrompt, setDatePrompt] = useState(null); // { id, value }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);

  const patch = (id, changes) => state.setData((list) => list.map((a) => (a._id === id ? { ...a, ...changes } : a)));
  const replace = (updated) => patch(updated._id, updated);

  const filtered = apps.filter((a) => (view === 'board' || filter === 'All' || a.status === filter)
    && (!q.trim() || `${a.job.title} ${a.job.company.name}`.toLowerCase().includes(q.trim().toLowerCase())));
  const countFor = (s) => apps.filter((a) => a.status === s).length;
  const selected = apps.find((a) => a._id === selectedId);

  // Optimistic move: the card jumps immediately and snaps back if the server refuses.
  const move = async (app, status) => {
    const previous = app.status;
    if (previous === status) return;
    patch(app._id, { status });
    try {
      replace(await updateApplicationStatus(app._id, { status }));
      toast.success(`Moved to ${status}`);
      if (status === 'Interview' && !app.interviewDate) setDatePrompt({ id: app._id, value: '' });
    } catch (err) {
      patch(app._id, { status: previous });
      toast.error(errorMessage(err));
    }
  };

  const onDragEnd = ({ draggableId, destination, source }) => {
    if (!destination || destination.droppableId === source.droppableId) return;
    const app = apps.find((a) => a._id === draggableId);
    if (app) move(app, destination.droppableId);
  };

  const saveInterview = async () => {
    setBusy(true);
    try {
      replace(await updateApplication(datePrompt.id, { interviewDate: new Date(datePrompt.value).toISOString() }));
      toast.success('Interview date saved');
      setDatePrompt(null);
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await deleteApplication(deleteTarget._id);
      state.setData((list) => list.filter((a) => a._id !== deleteTarget._id));
      toast.success('Application deleted');
      setDeleteTarget(null);
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  const tab = (v) => `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${view === v ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-ink'}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">My applications</h1>
          <p className="mt-1 text-slate-600">{state.data ? `${apps.length} ${apps.length === 1 ? 'application' : 'applications'} tracked. Drag a card to change its stage.` : 'Loading your applications'}</p>
        </div>
        <div role="group" aria-label="View" className="flex gap-1 rounded-xl bg-slate-100 p-1">
          <button className={tab('board')} aria-pressed={view === 'board'} onClick={() => setView('board')}><LayoutGrid size={16} />Board</button>
          <button className={tab('list')} aria-pressed={view === 'list'} onClick={() => setView('list')}><List size={16} />List</button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="relative sm:w-72">
          <span className="sr-only">Search applications</span>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by job or company" />
        </label>
        {view === 'list' && (
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {['All', ...STATUSES].map((s) => (
              <button key={s} onClick={() => setFilter(s)} aria-pressed={filter === s}
                className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${filter === s ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'}`}>
                {s}{s !== 'All' && <span className="ml-1.5 opacity-70">{countFor(s)}</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6">
        {state.loading && <div className="flex gap-4 overflow-hidden">{STATUSES.map((s) => <Skeleton key={s} className="h-72 min-w-[15rem] flex-1 rounded-2xl" />)}</div>}
        {!state.loading && state.error && <div className="card"><EmptyState icon={FileText} title="We could not load your applications" description={state.error} action={{ label: 'Try again', onClick: state.reload, variant: 'secondary' }} /></div>}
        {!state.loading && !state.error && apps.length === 0 && (
          <div className="card"><EmptyState icon={FileText} title="You have not applied to any jobs yet" description="Applications you send appear here, and you can track them from Applied to Offer." action={{ label: 'Find jobs', to: '/dashboard/jobs' }} /></div>
        )}

        {!state.loading && apps.length > 0 && view === 'board' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STATUSES.map((status) => {
                const items = filtered.filter((a) => a.status === status);
                return (
                  <Droppable droppableId={status} key={status}>
                    {(drop, snap) => (
                      <section ref={drop.innerRef} {...drop.droppableProps} aria-label={`${status}, ${items.length} applications`}
                        className={`min-h-[22rem] min-w-[15rem] flex-1 rounded-2xl p-3 transition ${snap.isDraggingOver ? 'bg-primary-50 ring-2 ring-primary-200' : 'bg-slate-100/80'}`}>
                        <div className="mb-3 flex items-center gap-2 px-1 text-sm font-bold">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[status] }} />{status}
                          <span className="ml-auto rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">{items.length}</span>
                        </div>
                        {items.map((a, index) => (
                          <Draggable key={a._id} draggableId={a._id} index={index}>
                            {(drag, dragSnap) => (
                              <article ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps} onClick={() => setSelectedId(a._id)}
                                style={drag.draggableProps.style}
                                className={`mb-3 cursor-grab rounded-xl border bg-white p-3 transition-shadow ${dragSnap.isDragging ? 'border-primary-300 shadow-lift' : 'border-slate-200 shadow-sm hover:border-primary-200'}`}>
                                <div className="flex items-center gap-2.5">
                                  <CompanyLogo name={a.job.company.name} logo={a.job.company.logo} size={32} />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-bold">{a.job.title}</p>
                                    <p className="truncate text-xs text-slate-500">{a.job.company.name}</p>
                                  </div>
                                </div>
                                <p className="mt-2.5 text-xs text-slate-400">Applied {formatDate(a.createdAt)}</p>
                                {a.interviewDate && <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700"><CalendarClock size={13} />{formatDateTime(a.interviewDate)}</p>}
                                {a.notes && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{a.notes}</p>}
                              </article>
                            )}
                          </Draggable>
                        ))}
                        {drop.placeholder}
                        {items.length === 0 && !snap.isDraggingOver && <p className="px-2 py-6 text-center text-xs text-slate-400">No applications here</p>}
                      </section>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}

        {!state.loading && apps.length > 0 && view === 'list' && (
          filtered.length === 0 ? (
            <div className="card"><EmptyState icon={Search} title="No applications match" description="Try a different search or status filter." action={{ label: 'Reset', onClick: () => { setQ(''); setFilter('All'); }, variant: 'secondary' }} /></div>
          ) : (
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[46rem] text-left text-sm">
                <thead className="border-b border-slate-100 text-xs font-semibold text-slate-500">
                  <tr><th className="px-4 py-3">Job</th><th className="px-4 py-3">Applied</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Interview</th><th className="px-4 py-3">Resume</th><th className="px-4 py-3"><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((a) => (
                    <tr key={a._id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <CompanyLogo name={a.job.company.name} logo={a.job.company.logo} size={36} />
                          <div className="min-w-0">
                            <Link to={`/dashboard/jobs/${a.job._id}`} className="block truncate font-bold hover:text-primary-700">{a.job.title}</Link>
                            <p className="truncate text-xs text-slate-500">{a.job.company.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{formatDate(a.createdAt)}</td>
                      <td className="px-4 py-3"><StatusSelect value={a.status} onChange={(s) => move(a, s)} /></td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">{a.interviewDate ? formatDateTime(a.interviewDate) : 'Not set'}</td>
                      <td className="max-w-[10rem] truncate px-4 py-3 text-slate-600">{a.resume?.originalName || 'None'}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="soft" onClick={() => setSelectedId(a._id)}>Details</Button>
                          <button onClick={() => setDeleteTarget(a)} aria-label={`Delete application to ${a.job.title}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {selected && <ApplicationDetailModal key={selected._id} application={selected} onClose={() => setSelectedId(null)} onChange={replace} onDelete={(id) => state.setData((l) => l.filter((a) => a._id !== id))} />}

      <Modal open={!!datePrompt} onClose={() => setDatePrompt(null)} title="When is the interview?" width="max-w-sm">
        <p className="mb-4 text-sm text-slate-600">Add the date so it shows on your overview. You can skip this and add it later.</p>
        <input type="datetime-local" aria-label="Interview date and time" className="input" value={datePrompt?.value || ''} onChange={(e) => setDatePrompt({ ...datePrompt, value: e.target.value })} />
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setDatePrompt(null)}>Skip</Button>
          <Button loading={busy} disabled={!datePrompt?.value} onClick={saveInterview}>Save date</Button>
        </div>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} busy={busy} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Delete this application?"
        message={deleteTarget ? `This removes your application to ${deleteTarget.job.title} at ${deleteTarget.job.company.name} and its history.` : ''} />
    </div>
  );
}
