import { useEffect, useState } from 'react';
import { LayoutGroup, motion, useReducedMotion } from 'framer-motion';
import CompanyLogo from '../../../components/common/CompanyLogo';

const COLUMNS = [
  { key: 'Applied', dot: 'bg-primary-500' },
  { key: 'Interview', dot: 'bg-violet-500' },
  { key: 'Offer', dot: 'bg-emerald-500' },
];
// Illustrative preview only; the real board lives in the dashboard.
const START = [
  { id: 'a', title: 'Frontend Engineer', company: 'Razorpay', col: 0 },
  { id: 'b', title: 'Product Designer', company: 'Postman', col: 0 },
  { id: 'c', title: 'Backend Engineer', company: 'Zerodha', col: 1 },
  { id: 'd', title: 'Full Stack Developer', company: 'Swiggy', col: 1 },
  { id: 'e', title: 'Data Analyst', company: 'Freshworks', col: 2 },
];
const MOVES = [['c', 2], ['b', 1], ['a', 1], ['d', 2]];

export default function HeroBoard() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (reduce) return undefined;
    const t = setInterval(() => setStep((s) => (s >= MOVES.length ? 0 : s + 1)), 2400);
    return () => clearInterval(t);
  }, [reduce]);

  const cards = START.map((c) => {
    let col = c.col;
    MOVES.slice(0, step).forEach(([id, to]) => { if (id === c.id) col = to; });
    return { ...c, col };
  });

  return (
    <div className="relative" aria-hidden="true">
      <div className="absolute -inset-4 rounded-[2rem] bg-brand opacity-15 blur-2xl" />
      <div className="relative rounded-panel border border-slate-200 bg-white p-4 shadow-lift">
        <div className="mb-3 flex items-center justify-between px-1">
          <p className="text-sm font-bold">My applications</p>
          <p className="text-xs text-slate-400">5 active</p>
        </div>
        <LayoutGroup>
          <div className="grid grid-cols-3 gap-3">
            {COLUMNS.map((column, i) => {
              const items = cards.filter((c) => c.col === i);
              return (
                <div key={column.key} className="min-h-[19rem] rounded-2xl bg-surface p-2.5">
                  <div className="mb-2.5 flex items-center gap-2 px-1 text-xs font-semibold text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                    {column.key}
                    <span className="ml-auto rounded-md bg-white px-1.5 py-0.5 text-slate-400">{items.length}</span>
                  </div>
                  <div className="space-y-2.5">
                    {items.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        layoutId={`hero-${c.id}`}
                        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
                      >
                        <CompanyLogo name={c.company} size={26} />
                        <p className="mt-2 text-xs font-bold leading-snug">{c.title}</p>
                        <p className="text-[11px] text-slate-500">{c.company}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </LayoutGroup>
      </div>
    </div>
  );
}
