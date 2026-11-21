const TABS = [['seeker', 'Job seeker'], ['recruiter', 'Recruiter']];

export default function RoleTabs({ value, onChange }) {
  return (
    <div role="tablist" aria-label="Account type" className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
      {TABS.map(([key, label]) => (
        <button key={key} type="button" role="tab" aria-selected={value === key} onClick={() => onChange(key)}
          className={`rounded-lg py-2 text-sm font-semibold transition ${value === key ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-ink'}`}>
          {label}
        </button>
      ))}
    </div>
  );
}
