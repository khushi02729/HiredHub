import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Briefcase, Search, SlidersHorizontal } from 'lucide-react';
import JobCard from '../../components/jobs/JobCard';
import JobFilters from '../../components/jobs/JobFilters';
import { Select } from '../../components/common/Dropdown';
import Pagination from '../../components/common/Pagination';
import EmptyState from '../../components/common/EmptyState';
import { JobCardSkeleton } from '../../components/common/Skeleton';
import useFetch from '../../hooks/useFetch';
import useDebounce from '../../hooks/useDebounce';
import useToggleSave from '../../hooks/useToggleSave';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { getFilterOptions, getJobs } from '../../services/jobService';

const PAGE_SIZE = 9;
const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'salaryHigh', label: 'Salary: high to low' },
  { value: 'salaryLow', label: 'Salary: low to high' },
];

// Used for /jobs (public) and /dashboard/jobs. All filter state lives in the URL, so searches are shareable.
export default function JobsPage({ basePath = '/jobs', embedded = false }) {
  useDocumentTitle('Find jobs');
  const [params, setParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const get = (k) => params.get(k) || '';
  const list = (k) => (get(k) ? get(k).split(',') : []);

  const filters = {
    q: get('q'), skills: list('skills'), location: get('location'), company: get('company'),
    minSalary: get('minSalary'), maxSalary: get('maxSalary'),
    experience: list('experience'), type: list('type'), workMode: list('workMode'),
    sort: get('sort') || 'newest', page: Number(get('page')) || 1,
  };
  const activeCount = [filters.q, filters.skills.length, filters.location, filters.company, filters.minSalary, filters.maxSalary,
    filters.experience.length, filters.type.length, filters.workMode.length].filter(Boolean).length;

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => {
      if (v === '' || v == null || (Array.isArray(v) && !v.length)) next.delete(k);
      else next.set(k, Array.isArray(v) ? v.join(',') : v);
    });
    if (!('page' in patch)) next.delete('page'); // any filter change goes back to page 1
    setParams(next, { replace: true });
  };
  const clearAll = () => setParams({}, { replace: true });

  // Search box: type freely, query the API after a short pause
  const [q, setQ] = useState(filters.q);
  const dq = useDebounce(q, 400);
  useEffect(() => { setQ(filters.q); }, [filters.q]);
  useEffect(() => { if (dq.trim() !== filters.q) update({ q: dq.trim() }); }, [dq]); // eslint-disable-line react-hooks/exhaustive-deps

  const jobsState = useFetch(() => getJobs({ ...Object.fromEntries(params), limit: PAGE_SIZE }), [params.toString()]);
  const optionsState = useFetch(getFilterOptions, []);
  const options = optionsState.data || { skills: [], locations: [], companies: [] };
  const { data, loading, error } = jobsState;
  const toggleSave = useToggleSave((fn) => jobsState.setData((d) => ({ ...d, jobs: fn(d.jobs) })));

  const goToPage = (page) => { update({ page: page > 1 ? String(page) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <div className={embedded ? '' : 'mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8'}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Find your next role</h1>
          <p className="mt-1 text-slate-600" aria-live="polite">{data ? `${data.total.toLocaleString('en-IN')} ${data.total === 1 ? 'job' : 'jobs'} match your search` : 'Searching jobs'}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search jobs</span>
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title, skill or company" />
        </label>
        <div className="flex gap-3">
          <div className="w-52"><Select value={filters.sort} options={SORTS} onChange={(v) => update({ sort: v === 'newest' ? '' : v })} /></div>
          <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters}
            className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold lg:hidden">
            <SlidersHorizontal size={16} />Filters{activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[19rem_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="lg:sticky lg:top-24"><JobFilters filters={filters} options={options} onChange={update} onClear={clearAll} activeCount={activeCount} /></div>
        </aside>

        <section aria-label="Job results">
          {loading && <div className="grid gap-5 sm:grid-cols-2">{Array.from({ length: 6 }, (_, i) => <JobCardSkeleton key={i} />)}</div>}
          {!loading && error && <div className="card"><EmptyState icon={Briefcase} title="We could not load jobs" description={error} action={{ label: 'Try again', onClick: jobsState.reload, variant: 'secondary' }} /></div>}
          {!loading && !error && data?.jobs.length === 0 && (
            <div className="card"><EmptyState icon={Search} title="No jobs match these filters" description="Try removing a filter or searching with different keywords."
              action={activeCount ? { label: 'Clear filters', onClick: clearAll } : undefined} /></div>
          )}
          {!loading && !error && data?.jobs.length > 0 && (
            <>
              <div className="grid gap-5 sm:grid-cols-2">
                {data.jobs.map((job) => <JobCard key={job._id} job={job} basePath={basePath} onToggleSave={toggleSave} />)}
              </div>
              <Pagination page={data.page} pages={data.pages} onChange={goToPage} />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
