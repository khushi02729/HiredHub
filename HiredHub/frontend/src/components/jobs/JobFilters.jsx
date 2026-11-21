import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { MultiSelect, Select } from '../common/Dropdown';
import useDebounce from '../../hooks/useDebounce';

const LEVELS = ['Entry', 'Mid', 'Senior', 'Lead'];
const TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship'];
const MODES = ['Remote', 'Hybrid', 'On-site'];
const toLpa = (v) => (v ? String(Math.round(Number(v) / 100000)) : '');
const toRupees = (v) => (v ? String(Number(v) * 100000) : '');

function ChipGroup({ label, options, values, onChange }) {
  const toggle = (o) => onChange(values.includes(o) ? values.filter((v) => v !== o) : [...values, o]);
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-slate-700">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" onClick={() => toggle(o)} aria-pressed={values.includes(o)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${values.includes(o) ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300'}`}>{o}</button>
        ))}
      </div>
    </fieldset>
  );
}

// Salary is entered in lakhs per year (LPA) and sent to the API in rupees.
export default function JobFilters({ filters, options, onChange, onClear, activeCount }) {
  const [min, setMin] = useState(toLpa(filters.minSalary));
  const [max, setMax] = useState(toLpa(filters.maxSalary));
  useEffect(() => { setMin(toLpa(filters.minSalary)); setMax(toLpa(filters.maxSalary)); }, [filters.minSalary, filters.maxSalary]);
  const dMin = useDebounce(min, 500);
  const dMax = useDebounce(max, 500);
  useEffect(() => {
    const lo = toRupees(dMin);
    const hi = toRupees(dMax);
    if (lo !== (filters.minSalary || '') || hi !== (filters.maxSalary || '')) onChange({ minSalary: lo, maxSalary: hi });
  }, [dMin, dMax]); // eslint-disable-line react-hooks/exhaustive-deps

  const digits = (setter) => (e) => setter(e.target.value.replace(/\D/g, '').slice(0, 4));

  return (
    <div className="card space-y-5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-bold">Filters{activeCount > 0 && <span className="ml-2 rounded-full bg-primary-50 px-2 py-0.5 text-xs text-primary-700">{activeCount}</span>}</h2>
        {activeCount > 0 && <button onClick={onClear} className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700 hover:underline"><X size={14} />Clear filters</button>}
      </div>
      <MultiSelect label="Skills" values={filters.skills} options={options.skills} onChange={(v) => onChange({ skills: v })} placeholder="Any skill" />
      <Select label="Location" value={filters.location} options={options.locations} anyLabel="Any location" searchable onChange={(v) => onChange({ location: v })} />
      <Select label="Company" value={filters.company} options={options.companies} anyLabel="Any company" searchable onChange={(v) => onChange({ company: v })} />
      <div>
        <span className="mb-1.5 block text-sm font-semibold text-slate-700">Salary per year (lakhs)</span>
        <div className="flex items-center gap-2">
          <input className="input" inputMode="numeric" placeholder="Min" aria-label="Minimum salary in lakhs" value={min} onChange={digits(setMin)} />
          <span className="text-slate-400">to</span>
          <input className="input" inputMode="numeric" placeholder="Max" aria-label="Maximum salary in lakhs" value={max} onChange={digits(setMax)} />
        </div>
      </div>
      <ChipGroup label="Experience level" options={LEVELS} values={filters.experience} onChange={(v) => onChange({ experience: v })} />
      <ChipGroup label="Employment type" options={TYPES} values={filters.type} onChange={(v) => onChange({ type: v })} />
      <ChipGroup label="Work mode" options={MODES} values={filters.workMode} onChange={(v) => onChange({ workMode: v })} />
    </div>
  );
}
