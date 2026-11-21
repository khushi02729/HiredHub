import { useState } from 'react';
import toast from 'react-hot-toast';
import { Download, Eye } from 'lucide-react';
import Button from '../common/Button';
import { errorMessage } from '../../services/api';
import { openResume } from '../../services/resumeService';

export default function ResumeButtons({ resume }) {
  const [busy, setBusy] = useState('');
  if (!resume) return <p className="text-sm text-slate-500">No resume attached.</p>;
  const run = (download) => async () => {
    setBusy(download ? 'download' : 'preview');
    try { await openResume(resume, { download }); } catch (err) { toast.error(errorMessage(err, 'Could not open the resume.')); } finally { setBusy(''); }
  };
  return (
    <div className="flex flex-wrap gap-2">
      {resume.mimeType === 'application/pdf' && <Button size="sm" variant="secondary" icon={Eye} loading={busy === 'preview'} onClick={run(false)}>Preview</Button>}
      <Button size="sm" variant="secondary" icon={Download} loading={busy === 'download'} onClick={run(true)}>Download</Button>
    </div>
  );
}
