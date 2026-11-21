import { ChevronLeft, ChevronRight } from 'lucide-react';

const range = (page, pages) => {
  const out = [];
  for (let p = 1; p <= pages; p += 1) if (p === 1 || p === pages || Math.abs(p - page) <= 1) out.push(p);
  return out.reduce((acc, p, i) => (i && p - out[i - 1] > 1 ? [...acc, '…', p] : [...acc, p]), []);
};

export default function Pagination({ page, pages, onChange }) {
  if (pages <= 1) return null;
  const btn = 'grid h-10 min-w-[2.5rem] place-items-center rounded-xl border px-3 text-sm font-semibold transition';
  return (
    <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
      <button className={`${btn} border-slate-200 bg-white hover:border-primary-300 disabled:opacity-40`} disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
      {range(page, pages).map((p, i) => (p === '…'
        ? <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
        : <button key={p} onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}
            className={`${btn} ${p === page ? 'border-transparent bg-brand text-white shadow-sm' : 'border-slate-200 bg-white hover:border-primary-300'}`}>{p}</button>))}
      <button className={`${btn} border-slate-200 bg-white hover:border-primary-300 disabled:opacity-40`} disabled={page >= pages} onClick={() => onChange(page + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
    </nav>
  );
}
