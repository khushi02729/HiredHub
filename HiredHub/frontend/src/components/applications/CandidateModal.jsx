import { useState } from 'react';
import toast from 'react-hot-toast';
import { Github, Globe, Linkedin, Mail, Phone, Star } from 'lucide-react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import StatusSelect from './StatusSelect';
import HistoryTimeline from './HistoryTimeline';
import ResumeButtons from './ResumeButtons';
import MatchRing from '../jobs/MatchRing';
import { setShortlisted, updateApplication, updateApplicationStatus } from '../../services/applicationService';
import { errorMessage } from '../../services/api';
import { formatDate, formatSalary, toLocalInput } from '../../utils/format';

const Block = ({ title, children }) => (
  <section className="border-t border-slate-100 pt-5">
    <h3 className="mb-2.5 text-sm font-bold text-slate-800">{title}</h3>
    {children}
  </section>
);
const Link = ({ href, icon: Icon, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-700 hover:underline"><Icon size={15} />{children}</a>
);

// Recruiter's view of one applicant: profile, match breakdown, resume, pipeline controls.
export default function CandidateModal({ application: app, onClose, onChange }) {
  const [busy, setBusy] = useState('');
  const [interview, setInterview] = useState(toLocalInput(app.interviewDate));
  const p = app.applicant;
  const match = app.match;

  const run = async (key, fn, success) => {
    setBusy(key);
    try { onChange(await fn()); toast.success(success); } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(''); }
  };

  return (
    <Modal open onClose={onClose} title="Candidate" width="max-w-2xl">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <Avatar user={p} size={60} />
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold">{p.name}</h3>
            <p className="text-sm text-slate-500">{p.headline || 'No headline'}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
              <Link href={`mailto:${p.email}`} icon={Mail}>{p.email}</Link>
              {p.phone && <Link href={`tel:${p.phone}`} icon={Phone}>{p.phone}</Link>}
              {p.linkedin && <Link href={p.linkedin} icon={Linkedin}>LinkedIn</Link>}
              {p.github && <Link href={p.github} icon={Github}>GitHub</Link>}
              {p.portfolio && <Link href={p.portfolio} icon={Globe}>Portfolio</Link>}
            </div>
          </div>
          {match && <MatchRing value={match.matchPercent} size={64} />}
        </div>

        <div className="grid gap-4 rounded-xl bg-surface p-4 sm:grid-cols-[1fr_auto]">
          <div>
            <span className="mb-1.5 block text-sm font-semibold text-slate-700">Pipeline stage</span>
            <StatusSelect value={app.status} disabled={busy === 'status'} className="w-full sm:w-52"
              onChange={(s) => run('status', () => updateApplicationStatus(app._id, { status: s }), `Moved to ${s}`)} />
          </div>
          <div className="flex items-end">
            <Button variant={app.shortlisted ? 'soft' : 'secondary'} icon={Star} loading={busy === 'shortlist'}
              onClick={() => run('shortlist', () => setShortlisted(app._id, !app.shortlisted), app.shortlisted ? 'Removed from shortlist' : 'Shortlisted')}>
              {app.shortlisted ? 'Shortlisted' : 'Shortlist'}
            </Button>
          </div>
          {app.status === 'Interview' && (
            <div className="sm:col-span-2">
              <label htmlFor="cand-interview" className="mb-1.5 block text-sm font-semibold text-slate-700">Interview date</label>
              <div className="flex gap-2">
                <input id="cand-interview" type="datetime-local" className="input h-9 flex-1 text-sm" value={interview} onChange={(e) => setInterview(e.target.value)} />
                <Button size="sm" variant="secondary" loading={busy === 'interview'} disabled={interview === toLocalInput(app.interviewDate)}
                  onClick={() => run('interview', () => updateApplication(app._id, { interviewDate: interview ? new Date(interview).toISOString() : '' }), 'Interview date saved')}>Save</Button>
              </div>
            </div>
          )}
        </div>

        {match && (
          <Block title="Match for this job">
            <p className="mb-3 text-xs text-slate-500">Skills {match.breakdown.skills} of {match.weights.skills}, experience {match.breakdown.experience} of {match.weights.experience}, location {match.breakdown.location} of {match.weights.location}.</p>
            <div className="flex flex-wrap gap-1.5">
              {match.matchingSkills.map((s) => <span key={s} className="rounded-lg bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">{s}</span>)}
              {match.missingSkills.map((s) => <span key={s} className="rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">Missing {s}</span>)}
            </div>
          </Block>
        )}

        <Block title="Profile">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-slate-500">Experience</dt><dd className="font-semibold">{p.experienceYears ?? 0} years</dd></div>
            <div><dt className="text-slate-500">Expected salary</dt><dd className="font-semibold">{p.expectedSalary ? formatSalary({ min: p.expectedSalary, max: p.expectedSalary }).split(' – ')[0] : 'Not shared'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-slate-500">Preferred locations</dt><dd className="font-semibold">{p.preferredLocations?.length ? p.preferredLocations.join(', ') : 'Not shared'}</dd></div>
            <div className="sm:col-span-2">
              <dt className="mb-1 text-slate-500">Education</dt>
              <dd>{p.education?.length ? p.education.map((e) => <p key={e._id || e.school} className="font-semibold">{[e.degree, e.field].filter(Boolean).join(' in ')}, {e.school}{e.endYear ? ` (${e.endYear})` : ''}</p>) : <span className="font-semibold">Not shared</span>}</dd>
            </div>
          </dl>
        </Block>

        <Block title={`Resume (applied ${formatDate(app.createdAt)})`}>
          {app.resume && <p className="mb-2.5 text-sm text-slate-700">{app.resume.originalName}</p>}
          <ResumeButtons resume={app.resume} />
        </Block>

        {app.coverLetter && <Block title="Cover letter"><p className="max-h-44 overflow-y-auto whitespace-pre-line rounded-xl bg-surface p-3.5 text-sm leading-relaxed text-slate-700">{app.coverLetter}</p></Block>}
        <Block title="History"><HistoryTimeline history={app.history} viewerRole="recruiter" /></Block>
        <div className="flex justify-end border-t border-slate-100 pt-5"><Button variant="secondary" onClick={onClose}>Close</Button></div>
      </div>
    </Modal>
  );
}
