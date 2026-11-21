import { STATUSES } from '../../utils/constants';

export default function StatusSelect({ value, onChange, disabled, className = '' }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled} aria-label="Application status"
      className={`h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-semibold text-ink transition focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-100 disabled:opacity-60 ${className}`}>
      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}
