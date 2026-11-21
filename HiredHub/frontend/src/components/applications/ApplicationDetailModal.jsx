import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CalendarClock, FileText, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import ConfirmDialog from '../common/ConfirmDialog';
import CompanyLogo from '../common/CompanyLogo';
import StatusBadge from '../common/StatusBadge';
import StatusSelect from './StatusSelect';
import HistoryTimeline from './HistoryTimeline';
import ResumeButtons from './ResumeButtons';
import { deleteApplication, updateApplication, updateApplicationStatus } from '../../services/applicationService';
import { errorMessage } from '../../services/api';
import { formatDate, formatSalary, toLocalInput } from '../../utils/format';

const Block = ({ title, children }) => (
  <section className="border-t border-slate-100 pt-5">
    <h3 className="mb-2.5 text-sm font-bold text-slate-800">{title}</h3>
    {children}
  </section>
);

// Seeker's view of one application: status, interview date, notes, resume, history, delete.
export default function ApplicationDetailModal({ application: app, onClose, onChange, onDelete }) {
  const [notes, setNotes] = useState(app.notes || '');
  const [interview, setInterview] = useState(toLocalInput(app.interviewDate));
  const [busy, setBusy] = useState('');
  const [confirm, setConfirm] = useState(false);

  const run = async (key, fn, success) => {
    setBusy(key);
    try { const updated = await fn(); onChange(updated); toast.success(success); return true; }
    catch (err) { toast.error(errorMessage(err)); return false; }
    finally { setBusy(''); }
  };

  const changeStatus = (status) => run('status', () => updateApplicationStatus(app._id, { status }), `Moved to ${status}`);
  const saveNotes = () => run('notes', () => updateApplication(app._id, { notes }), 'Notes saved');
  const saveInterview = () => run('interview', () => updateApplication(app._id, { interviewDate: interview ? new Date(interview).toISOString() : '' }), interview ? 'Interview date saved' : 'Interview date cleared');

  const remove = async () => {
    setBusy('delete');
    try { await deleteApplication(app._id); toast.success('Application deleted'); onDelete(app._id); onClose(); }
    catch (err) { toast.error(errorMessage(err)); setBusy(''); setConfirm(false); }
  };

  return (
    <>
      <Modal open onClose={onClose} title="Application details" width="max-w-2xl">
        <div className="space-y-5">
          <div className="flex items-start gap-3">
            <CompanyLogo name={app.job.company.name} logo={app.job.company.logo} size={48} />
            <div className="min-w-0 flex-1">
              <Link to={`/dashboard/jobs/${app.job._id}`} onClick={onClose} className="block truncate text-lg font-bold hover:text-primary-700">{app.job.title}</Link>
              <p className="text-sm text-slate-500">{app.job.company.name}, {app.job.location}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-700">{formatSalary(app.job.salary)}</p>
            </div>
            <StatusBadge status={app.status} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <span className="mb-1.5 block text-sm font-semibold text-slate-700">Status</span>
              <StatusSelect value={app.status} onChange={changeStatus} disabled={busy === 'status'} className="w-full" />
              <p className="mt-1.5 text-xs text-slate-500">Applied on {formatDate(app.createdAt)}</p>
            </div>
            <div>
              <label htmlFor="interview" className="mb-1.5 block text-sm font-semibold text-slate-700">Interview date</label>
              <div className="flex gap-2">
                <input id="interview" type="datetime-local" className="input h-9 flex-1 text-sm" value={interview} onChange={(e) => setInterview(e.target.value)} />
                <Button size="sm" variant="secondary" icon={CalendarClock} loading={busy === 'interview'} disabled={interview === toLocalInput(app.interviewDate)} onClick={saveInterview}>Save</Button>
              </div>
            </div>
          </div>

          <Block title="Your notes">
            <Textarea name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} maxLength={2000} placeholder="Contacts, questions to prepare, follow-up dates." />
            <Button size="sm" loading={busy === 'notes'} disabled={notes === (app.notes || '')} onClick={saveNotes}>Save notes</Button>
          </Block>

          <Block title="Resume submitted">
            {app.resume && <p className="mb-2.5 inline-flex items-center gap-2 text-sm text-slate-700"><FileText size={16} className="text-primary-600" />{app.resume.originalName}</p>}
            <ResumeButtons resume={app.resume} />
          </Block>

          {app.coverLetter && <Block title="Cover letter"><p className="max-h-40 overflow-y-auto whitespace-pre-line rounded-xl bg-surface p-3.5 text-sm leading-relaxed text-slate-700">{app.coverLetter}</p></Block>}

          <Block title="History"><HistoryTimeline history={app.history} viewerRole="seeker" /></Block>

          <div className="flex justify-between border-t border-slate-100 pt-5">
            <Button variant="ghost" className="text-rose-600 hover:bg-rose-50" icon={Trash2} onClick={() => setConfirm(true)}>Delete</Button>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>
      <ConfirmDialog open={confirm} title="Delete this application?" busy={busy === 'delete'} onClose={() => setConfirm(false)} onConfirm={remove}
        message={`This removes your application to ${app.job.title} at ${app.job.company.name} and its history. The recruiter will no longer see it. You can apply again later.`} />
    </>
  );
}
