import { STATUS_STYLES } from '../common/StatusBadge';
import { formatDateTime } from '../../utils/format';

const NOTE_ONLY = ['Shortlisted', 'Removed from shortlist'];

// Newest first. `viewerRole` decides whether an entry reads "You" or the other party.
export default function HistoryTimeline({ history = [], viewerRole = 'seeker' }) {
  const rows = history.map((h, i) => {
    let text;
    if (i === 0) text = 'Application submitted';
    else if (NOTE_ONLY.includes(h.note)) text = h.note;
    else text = `Moved to ${h.status}${h.note ? `: ${h.note}` : ''}`;
    const actor = h.by === viewerRole ? 'You' : h.by === 'recruiter' ? 'Recruiter' : 'Applicant';
    return { ...h, text, actor };
  }).reverse();

  if (!rows.length) return <p className="text-sm text-slate-500">No history yet.</p>;
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {rows.map((r, i) => (
        <li key={i} className="relative">
          <span className={`absolute -left-[1.62rem] top-1 h-2.5 w-2.5 rounded-full ring-4 ring-white ${(STATUS_STYLES[r.status] || STATUS_STYLES.Applied).dot}`} />
          <p className="text-sm font-semibold">{r.text}</p>
          <p className="text-xs text-slate-500">{r.actor}, {formatDateTime(r.changedAt)}</p>
        </li>
      ))}
    </ol>
  );
}
