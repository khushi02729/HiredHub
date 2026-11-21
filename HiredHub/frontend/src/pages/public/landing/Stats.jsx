import { useEffect, useState } from 'react';
import { getStats } from '../../../services/jobService';
import Skeleton from '../../../components/common/Skeleton';

const ITEMS = [
  ['jobs', 'Open jobs'],
  ['companies', 'Hiring companies'],
  ['applications', 'Applications tracked'],
];

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { getStats().then(setStats).catch(() => setFailed(true)); }, []);
  if (failed) return null; // the page reads fine without numbers

  return (
    <section aria-label="HiredHub in numbers" className="border-y border-slate-200 bg-white">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-100 px-4 sm:grid-cols-3 sm:divide-x sm:divide-y-0 sm:px-6 lg:px-8">
        {ITEMS.map(([key, label]) => (
          <div key={key} className="px-6 py-7 text-center">
            <dd className="text-3xl font-extrabold tracking-tight">
              {stats ? stats[key].toLocaleString('en-IN') : <Skeleton className="mx-auto h-8 w-20" />}
            </dd>
            <dt className="mt-1 text-sm text-slate-500">{label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
