import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { STATUSES, STATUS_COLORS } from '../../utils/chart';

const grid = { color: '#F1F5F9' };
const yAxis = { beginAtZero: true, ticks: { precision: 0 }, grid, border: { display: false } };
const xAxis = { grid: { display: false }, border: { display: false } };

// Doughnut with the total in the middle and a legend that doubles as a count list.
export function StatusDoughnut({ byStatus, noun = 'applications' }) {
  const total = STATUSES.reduce((n, s) => n + (byStatus[s] || 0), 0);
  if (!total) return <p className="py-16 text-center text-sm text-slate-500">Nothing to show yet. Your status breakdown will appear here.</p>;
  const data = {
    labels: STATUSES,
    datasets: [{ data: STATUSES.map((s) => byStatus[s] || 0), backgroundColor: STATUSES.map((s) => STATUS_COLORS[s]), borderWidth: 3, borderColor: '#fff', hoverOffset: 4 }],
  };
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div className="relative h-44 w-44 shrink-0">
        <Doughnut data={data} options={{ cutout: '70%', maintainAspectRatio: false, plugins: { legend: { display: false } } }} aria-label={`${noun} by status`} />
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div><p className="text-3xl font-extrabold">{total}</p><p className="text-xs text-slate-500">{noun}</p></div>
        </div>
      </div>
      <ul className="w-full space-y-2.5 text-sm">
        {STATUSES.map((s) => (
          <li key={s} className="flex items-center justify-between gap-3">
            <span className="inline-flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[s] }} />{s}</span>
            <span className="font-semibold">{byStatus[s] || 0}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ActivityBar({ days }) {
  const data = {
    labels: days.map((d) => new Date(`${d.date}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{ label: 'Actions', data: days.map((d) => d.count), backgroundColor: '#6366F1', hoverBackgroundColor: '#4338CA', borderRadius: 8, maxBarThickness: 34 }],
  };
  const options = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => `${c.parsed.y} ${c.parsed.y === 1 ? 'action' : 'actions'}` } } },
    scales: { y: yAxis, x: xAxis },
  };
  return <div className="h-56"><Bar data={data} options={options} aria-label="Activity in the last 7 days" /></div>;
}

// Weekly totals over the last 8 weeks (each point is the Monday that starts the week)
export function TrendLine({ weeks, label = 'Applications' }) {
  const data = {
    labels: weeks.map((w) => new Date(`${w.weekStart}T00:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })),
    datasets: [{ label, data: weeks.map((w) => w.count), borderColor: '#4F46E5', backgroundColor: 'rgba(99,102,241,0.12)', fill: true, tension: 0.35, pointRadius: 4, pointBackgroundColor: '#fff', pointBorderColor: '#4F46E5', pointBorderWidth: 2 }],
  };
  const options = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: yAxis, x: xAxis } };
  return <div className="h-56"><Line data={data} options={options} aria-label={`${label} over the last 8 weeks`} /></div>;
}

// Horizontal bars, e.g. most applied categories or applicants per job
export function HorizontalBars({ items, labelKey, valueKey = 'count', color = '#7C3AED' }) {
  if (!items.length) return <p className="py-12 text-center text-sm text-slate-500">Nothing to show yet.</p>;
  const data = { labels: items.map((i) => i[labelKey]), datasets: [{ data: items.map((i) => i[valueKey]), backgroundColor: color, borderRadius: 8, maxBarThickness: 26 }] };
  const options = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true, ticks: { precision: 0 }, grid, border: { display: false } }, y: { grid: { display: false }, border: { display: false } } },
  };
  return <div style={{ height: Math.max(160, items.length * 44) }}><Bar data={data} options={options} /></div>;
}
