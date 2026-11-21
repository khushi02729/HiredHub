import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Star, Trash2, Upload } from 'lucide-react';
import Button from '../../components/common/Button';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import Skeleton from '../../components/common/Skeleton';
import ResumeButtons from '../../components/applications/ResumeButtons';
import useFetch from '../../hooks/useFetch';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { deleteResume, getResumes, replaceResume, setPrimaryResume, uploadResume } from '../../services/resumeService';
import { fileSize, formatDate } from '../../utils/format';

const ALLOWED = ['.pdf', '.doc', '.docx'];
const MAX_MB = 5;

const check = (file) => {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED.includes(ext)) return 'Upload a PDF, DOC or DOCX file';
  if (file.size > MAX_MB * 1024 * 1024) return `The file must be smaller than ${MAX_MB} MB`;
  return '';
};

export default function ResumePage() {
  useDocumentTitle('Resume');
  const state = useFetch(getResumes, []);
  const resumes = state.data || [];
  const uploadInput = useRef(null);
  const replaceInput = useRef(null);
  const [replaceId, setReplaceId] = useState(null);
  const [busy, setBusy] = useState('');
  const [dragging, setDragging] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const act = async (key, fn, success) => {
    setBusy(key);
    try { await fn(); toast.success(success); state.reload(); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(''); }
  };

  const upload = (file) => {
    const problem = check(file);
    if (problem) { toast.error(problem); return; }
    act('upload', () => uploadResume(file), 'Resume uploaded');
  };
  const onUploadPick = (e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) upload(f); };
  const onReplacePick = (e) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const problem = check(f);
    if (problem) { toast.error(problem); return; }
    act(`replace-${replaceId}`, () => replaceResume(replaceId, f), 'Resume replaced');
  };
  const onDrop = (e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); };

  const confirmDelete = async () => {
    setBusy('delete');
    try { await deleteResume(deleteTarget._id); toast.success('Resume deleted'); setDeleteTarget(null); state.reload(); }
    catch (err) { toast.error(errorMessage(err)); setDeleteTarget(null); }
    finally { setBusy(''); }
  };

  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Resume</h1>
      <p className="mt-1 text-slate-600">Keep up to 10 resumes and choose one each time you apply.</p>

      <label onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={onDrop}
        className={`mt-6 flex cursor-pointer flex-col items-center gap-2 rounded-card border-2 border-dashed px-6 py-10 text-center transition ${dragging ? 'border-primary-500 bg-primary-50' : 'border-slate-300 bg-white hover:border-primary-400 hover:bg-primary-50/40'}`}>
        <input ref={uploadInput} type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={onUploadPick} />
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-50 text-primary-600"><Upload size={22} /></span>
        <span className="font-semibold">{busy === 'upload' ? 'Uploading' : 'Drop a file here, or click to choose'}</span>
        <span className="text-xs text-slate-500">PDF, DOC or DOCX, up to {MAX_MB} MB</span>
      </label>

      <input ref={replaceInput} type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={onReplacePick} aria-label="Choose replacement file" />

      <div className="mt-6 space-y-3">
        {state.loading && Array.from({ length: 2 }, (_, i) => <Skeleton key={i} className="h-24 rounded-card" />)}
        {!state.loading && state.error && <div className="card"><EmptyState icon={FileText} title="We could not load your resumes" description={state.error} action={{ label: 'Try again', onClick: state.reload, variant: 'secondary' }} /></div>}
        {!state.loading && !state.error && resumes.length === 0 && <div className="card"><EmptyState icon={FileText} title="No resumes yet" description="Upload your first resume above. You can then attach it to any application." /></div>}
        {resumes.map((r) => (
          <article key={r._id} className="card flex flex-wrap items-center gap-4 p-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-50 text-primary-600"><FileText size={22} /></div>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-2 font-bold">
                <span className="truncate">{r.originalName}</span>
                {r.isPrimary && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">Primary</span>}
              </p>
              <p className="text-xs text-slate-500">{fileSize(r.size)}, uploaded {formatDate(r.createdAt)}, used in {r.applicationCount} {r.applicationCount === 1 ? 'application' : 'applications'}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ResumeButtons resume={r} />
              <Button size="sm" variant="ghost" loading={busy === `replace-${r._id}`} onClick={() => { setReplaceId(r._id); replaceInput.current?.click(); }}>Replace</Button>
              {!r.isPrimary && <Button size="sm" variant="ghost" icon={Star} loading={busy === `primary-${r._id}`} onClick={() => act(`primary-${r._id}`, () => setPrimaryResume(r._id), 'Primary resume updated')}>Make primary</Button>}
              <button onClick={() => setDeleteTarget(r)} aria-label={`Delete ${r.originalName}`} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>

      <ConfirmDialog open={!!deleteTarget} busy={busy === 'delete'} onClose={() => setDeleteTarget(null)} onConfirm={confirmDelete} title="Delete this resume?"
        message={deleteTarget ? `${deleteTarget.originalName} will be removed permanently. Resumes attached to an application cannot be deleted; replace the file instead.` : ''} />
    </div>
  );
}
