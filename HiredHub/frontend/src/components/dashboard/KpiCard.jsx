const TONES = {
  indigo: ['bg-primary-50 text-primary-600', 'from-primary-50/70'],
  violet: ['bg-violet-50 text-violet-600', 'from-violet-50/70'],
  emerald: ['bg-emerald-50 text-emerald-600', 'from-emerald-50/70'],
  amber: ['bg-amber-50 text-amber-600', 'from-amber-50/70'],
};

export default function KpiCard({ icon: Icon, label, value, tone = 'indigo', hint }) {
  const [tile, wash] = TONES[tone];
  return (
    <div className={`card relative overflow-hidden bg-gradient-to-br ${wash} to-white p-5`}>
      <div className={`grid h-11 w-11 place-items-center rounded-xl ${tile}`}><Icon size={22} /></div>
      <p className="mt-4 text-3xl font-extrabold tracking-tight">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
