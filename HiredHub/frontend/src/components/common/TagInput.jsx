import { useState } from 'react';
import { X } from 'lucide-react';

// Press Enter or comma to add a tag; Backspace on an empty field removes the last one.
export default function TagInput({ label, values, onChange, placeholder = 'Type and press Enter', error, hint, max = 30 }) {
  const [text, setText] = useState('');
  const add = (raw) => {
    const t = raw.trim();
    if (t && !values.some((v) => v.toLowerCase() === t.toLowerCase()) && values.length < max) onChange([...values, t]);
    setText('');
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(text); }
    else if (e.key === 'Backspace' && !text && values.length) onChange(values.slice(0, -1));
  };
  return (
    <div>
      {label && <span className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</span>}
      <div className={`flex min-h-[2.75rem] flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2.5 py-1.5 transition focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-100 ${error ? 'border-rose-400' : 'border-slate-200'}`}>
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 rounded-lg bg-primary-50 py-1 pl-2.5 pr-1.5 text-xs font-semibold text-primary-700">
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="rounded p-0.5 hover:bg-primary-100"><X size={12} /></button>
          </span>
        ))}
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} onBlur={() => add(text)} placeholder={values.length ? '' : placeholder}
          aria-label={label} className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm placeholder:text-slate-400 focus:outline-none" />
      </div>
      {error ? <p className="mt-1.5 text-xs font-medium text-rose-600">{error}</p> : hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
