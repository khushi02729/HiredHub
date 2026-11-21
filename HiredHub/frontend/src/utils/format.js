const lakhs = (n) => {
  const l = n / 100000;
  return l >= 100 ? `${+(l / 100).toFixed(1)}Cr` : `${+l.toFixed(1)}L`;
};
export const formatSalary = (s) => (s ? `₹${lakhs(s.min)} – ₹${lakhs(s.max)}` : '');

export const timeAgo = (date) => {
  const days = Math.floor((Date.now() - new Date(date)) / 864e5);
  if (days <= 0) return 'Posted today';
  if (days === 1) return 'Posted yesterday';
  if (days < 7) return `Posted ${days} days ago`;
  if (days < 30) return `Posted ${Math.floor(days / 7)} wk ago`;
  return `Posted ${new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`;
};

export const experienceLabel = (job) =>
  job.minExperience > 0 ? `${job.minExperience}+ yrs experience` : 'Freshers welcome';

export const initials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';

// Avatars are served by the API origin; in dev the Vite proxy handles the same-origin path.
export const assetUrl = (path) => (path ? `${import.meta.env.VITE_API_URL || ''}${path}` : '');

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
export const formatDateTime = (d) => (d ? new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '');

// Value for <input type="datetime-local"> in the user's own timezone
export const toLocalInput = (d) => {
  if (!d) return '';
  const x = new Date(d);
  const p = (n) => String(n).padStart(2, '0');
  return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}T${p(x.getHours())}:${p(x.getMinutes())}`;
};

export const fileSize = (n = 0) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);

export const lpaToRupees = (v) => Math.round(parseFloat(v) * 100000);
export const rupeesToLpa = (v) => (v ? String(+(v / 100000).toFixed(2)) : '');
