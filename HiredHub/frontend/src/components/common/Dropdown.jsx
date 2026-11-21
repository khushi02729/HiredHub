import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const down = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const key = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', down);
    document.addEventListener('keydown', key);
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key); };
  }, [open]);
  return { open, setOpen, ref };
}

const normalize = (options) => options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));

function Shell({ label, text, muted, open, setOpen, popRef, searchable, query, setQuery, children }) {
  return (
    <div className="relative" ref={popRef}>
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <button type="button" onClick={() => setOpen(!open)} aria-haspopup="listbox" aria-expanded={open}
        className={`input flex items-center justify-between gap-2 text-left ${open ? 'border-primary-500 ring-4 ring-primary-100' : ''}`}>
        <span className={`truncate ${muted ? 'text-slate-400' : ''}`}>{text}</span>
        <ChevronDown size={16} className={`shrink-0 text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-30 mt-2 w-full min-w-[12rem] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lift">
          {searchable && (
            <div className="relative border-b border-slate-100 p-2">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" aria-label="Search options"
                className="h-9 w-full rounded-lg bg-slate-50 pl-8 pr-2 text-sm focus:outline-none" />
            </div>
          )}
          <ul role="listbox" className="max-h-60 overflow-y-auto p-1">{children}</ul>
        </div>
      )}
    </div>
  );
}

const Row = ({ selected, onClick, children }) => (
  <li role="option" aria-selected={selected}>
    <button type="button" onClick={onClick}
      className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-primary-50 ${selected ? 'font-semibold text-primary-700' : 'text-slate-700'}`}>
      <span className="truncate">{children}</span>
      {selected && <Check size={15} className="shrink-0" />}
    </button>
  </li>
);

// Single choice. `anyLabel` adds a first row that clears the value.
export function Select({ label, value, onChange, options, placeholder = 'Select', anyLabel, searchable = false }) {
  const { open, setOpen, ref } = usePopover();
  const [query, setQuery] = useState('');
  const items = useMemo(() => normalize(options), [options]);
  const shown = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const current = items.find((i) => i.value === value);
  const pick = (v) => { onChange(v); setOpen(false); setQuery(''); };

  return (
    <Shell label={label} text={current?.label || value || anyLabel || placeholder} muted={!value && !current}
      open={open} setOpen={setOpen} popRef={ref} searchable={searchable} query={query} setQuery={setQuery}>
      {anyLabel && !query && <Row selected={!value} onClick={() => pick('')}>{anyLabel}</Row>}
      {shown.map((i) => <Row key={i.value} selected={i.value === value} onClick={() => pick(i.value)}>{i.label}</Row>)}
      {!shown.length && <li className="px-3 py-2 text-sm text-slate-400">No matches</li>}
    </Shell>
  );
}

// Several choices with checkmarks; the menu stays open while picking.
export function MultiSelect({ label, values, onChange, options, placeholder = 'Any', searchable = true }) {
  const { open, setOpen, ref } = usePopover();
  const [query, setQuery] = useState('');
  const items = useMemo(() => normalize(options), [options]);
  const shown = items.filter((i) => i.label.toLowerCase().includes(query.toLowerCase()));
  const toggle = (v) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  const text = values.length === 0 ? placeholder : values.length <= 2 ? values.join(', ') : `${values.length} selected`;

  return (
    <Shell label={label} text={text} muted={!values.length} open={open} setOpen={setOpen} popRef={ref}
      searchable={searchable} query={query} setQuery={setQuery}>
      {shown.map((i) => <Row key={i.value} selected={values.includes(i.value)} onClick={() => toggle(i.value)}>{i.label}</Row>)}
      {!shown.length && <li className="px-3 py-2 text-sm text-slate-400">No matches</li>}
    </Shell>
  );
}
