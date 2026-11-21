import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { FileText, Upload } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Textarea from '../common/Textarea';
import { errorMessage } from '../../services/api';
import { getResumes } from '../../services/resumeService';
import { applyToJob } from '../../services/applicationService';
import { formatDate } from '../../utils/format';

const ALLOWED = ['.pdf', '.doc', '.docx'];
const MAX_MB = 5;
const kb = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export default function ApplyModal({ job, open, onClose, onApplied }) {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('existing');
  const [resumeId, setResumeId] = useState('');
  const [file, setFile] = useState(null);
  const [cover, setCover] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError(''); setFile(null); setLoading(true);
    getResumes()
      .then((list) => {
        setResumes(list);
        const primary = list.find((r) => r.isPrimary) || list[0];
        setResumeId(primary?._id || '');
        setMode(primary ? 'existing' : 'upload');
      })
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [open]);

  const pickFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ext = f.name.slice(f.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED.includes(ext)) { setError('Upload a PDF, DOC or DOCX file'); setFile(null); return; }
    if (f.size > MAX_MB * 1024 * 1024) { setError(`The file must be smaller than ${MAX_MB} MB`); setFile(null); return; }
    setError(''); setFile(f);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (mode === 'existing' && !resumeId) { setError('Choose a resume to attach'); return; }
    if (mode === 'upload' && !file) { setError('Choose a file to upload'); return; }
    const body = new FormData();
    body.append('jobId', job._id);
    if (cover.trim()) body.append('coverLetter', cover.trim());
    if (mode === 'upload') body.append('resume', file); else body.append('resumeId', resumeId);
    setBusy(true); setError('');
    try {
      const application = await applyToJob(body);
      toast.success(`Application sent to ${job.company?.name}`);
      setCover('');
      onApplied?.(application);
      onClose();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const option = 'flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3 transition has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50';

  return (
    <Modal open={open} onClose={onClose} title={`Apply to ${job?.title || ''}`} width="max-w-xl">
      <p className="-mt-2 mb-5 text-sm text-slate-500">{job?.company?.name}</p>
      <form onSubmit={submit} noValidate className="space-y-5">
        <fieldset disabled={loading}>
          <legend className="mb-2 text-sm font-semibold text-slate-700">Resume</legend>
          <div className="space-y-2">
            {resumes.map((r) => (
              <label key={r._id} className={option}>
                <input type="radio" name="resume" className="accent-primary-600" checked={mode === 'existing' && resumeId === r._id} onChange={() => { setMode('existing'); setResumeId(r._id); setError(''); }} />
                <FileText size={18} className="shrink-0 text-primary-600" />
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{r.originalName}</span><span className="text-xs text-slate-500">{kb(r.size)}, added {formatDate(r.createdAt)}{r.isPrimary ? ', primary' : ''}</span></span>
              </label>
            ))}
            <label className={option}>
              <input type="radio" name="resume" className="accent-primary-600" checked={mode === 'upload'} onChange={() => { setMode('upload'); setError(''); }} />
              <Upload size={18} className="shrink-0 text-primary-600" />
              <span className="text-sm font-semibold">Upload a new resume</span>
            </label>
          </div>
          {mode === 'upload' && (
            <label className="mt-3 flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed border-slate-300 px-4 py-6 text-center transition hover:border-primary-400 hover:bg-primary-50/40">
              <input type="file" accept=".pdf,.doc,.docx" className="sr-only" onChange={pickFile} />
              <span className="text-sm font-semibold text-primary-700">{file ? file.name : 'Choose a file'}</span>
              <span className="text-xs text-slate-500">{file ? kb(file.size) : `PDF, DOC or DOCX, up to ${MAX_MB} MB`}</span>
            </label>
          )}
        </fieldset>

        <Textarea label="Cover letter (optional)" name="coverLetter" value={cover} onChange={(e) => setCover(e.target.value)} maxLength={4000}
          placeholder="Tell the recruiter why you are a good fit for this role." />

        {error && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={busy} disabled={loading}>Submit application</Button>
        </div>
      </form>
    </Modal>
  );
}
