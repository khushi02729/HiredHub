import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Briefcase } from 'lucide-react';
import Button from '../../components/common/Button';
import EmptyState from '../../components/common/EmptyState';
import { Select } from '../../components/common/Dropdown';
import Input from '../../components/common/Input';
import PageLoader from '../../components/common/PageLoader';
import TagInput from '../../components/common/TagInput';
import Textarea from '../../components/common/Textarea';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { getJob } from '../../services/jobService';
import { createJob, updateJob } from '../../services/recruiterService';
import { EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, JOB_CATEGORIES, WORK_MODES } from '../../utils/constants';
import { lpaToRupees, rupeesToLpa } from '../../utils/format';

const EMPTY = {
  title: '', location: '', workMode: 'Hybrid', employmentType: 'Full-time', experienceLevel: 'Mid', minExperience: '0',
  salaryMin: '', salaryMax: '', category: 'Engineering', description: '', responsibilities: '', qualifications: '', benefits: '', skills: [], status: 'active',
};
const lines = (t) => t.split('\n').map((l) => l.trim()).filter(Boolean);
const Section = ({ title, children }) => (<section className="card space-y-4 p-6"><h2 className="font-bold">{title}</h2>{children}</section>);

// One form for posting a new job and editing an existing one (/recruiter/jobs/:id/edit)
export default function JobForm() {
  const { id } = useParams();
  const editing = !!id;
  useDocumentTitle(editing ? 'Edit job' : 'Post a job');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!editing) return;
    getJob(id).then((j) => {
      if (j.recruiter?._id !== user._id) { setLoadError('You can only edit your own jobs.'); return; }
      setForm({
        title: j.title, location: j.location, workMode: j.workMode, employmentType: j.employmentType, experienceLevel: j.experienceLevel,
        minExperience: String(j.minExperience ?? 0), salaryMin: rupeesToLpa(j.salary.min), salaryMax: rupeesToLpa(j.salary.max),
        category: j.category || 'Other', description: j.description, responsibilities: (j.responsibilities || []).join('\n'),
        qualifications: (j.qualifications || []).join('\n'), benefits: (j.benefits || []).join('\n'), skills: j.skills || [], status: j.status,
      });
    }).catch((e) => setLoadError(errorMessage(e, 'Could not load this job.'))).finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: '' }); };
  const pick = (k) => (v) => setForm({ ...form, [k]: v });

  const validate = () => {
    const e = {};
    if (form.title.trim().length < 3) e.title = 'Enter a job title';
    if (!form.location.trim()) e.location = 'Enter a location';
    const lo = parseFloat(form.salaryMin); const hi = parseFloat(form.salaryMax);
    if (!(lo > 0)) e.salaryMin = 'Enter the minimum in lakhs per year';
    if (!(hi > 0)) e.salaryMax = 'Enter the maximum in lakhs per year';
    else if (lo > hi) e.salaryMax = 'The maximum cannot be below the minimum';
    const exp = Number(form.minExperience);
    if (Number.isNaN(exp) || exp < 0 || exp > 40) e.minExperience = 'Enter 0 to 40 years';
    if (form.description.trim().length < 30) e.description = 'Describe the role in at least 30 characters';
    if (!form.skills.length) e.skills = 'Add at least one required skill';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) { toast.error('Fix the highlighted fields'); return; }
    const body = {
      title: form.title.trim(), location: form.location.trim(), workMode: form.workMode, employmentType: form.employmentType,
      experienceLevel: form.experienceLevel, minExperience: Number(form.minExperience), category: form.category,
      salary: { min: lpaToRupees(form.salaryMin), max: lpaToRupees(form.salaryMax), currency: 'INR' },
      description: form.description.trim(), responsibilities: lines(form.responsibilities), qualifications: lines(form.qualifications),
      benefits: lines(form.benefits), skills: form.skills, status: form.status,
    };
    setBusy(true);
    try {
      if (editing) await updateJob(id, body); else await createJob(body);
      toast.success(editing ? 'Job updated' : 'Job posted');
      navigate('/recruiter/jobs');
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  if (loading) return <PageLoader />;
  if (loadError) return <div className="card"><EmptyState icon={Briefcase} title="We cannot open this job" description={loadError} action={{ label: 'Back to my jobs', to: '/recruiter/jobs' }} /></div>;

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{editing ? 'Edit job' : 'Post a job'}</h1>
        <p className="mt-1 text-slate-600">Posting as <strong>{user.company?.name}</strong>. <Link to="/recruiter/profile" className="font-semibold text-primary-700 hover:underline">Edit company details</Link></p>
      </div>

      <Section title="Basics">
        <Input label="Job title" name="title" value={form.title} onChange={set('title')} error={errors.title} placeholder="Senior Frontend Engineer" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Location" name="location" value={form.location} onChange={set('location')} error={errors.location} placeholder="Bengaluru" />
          <Select label="Work mode" value={form.workMode} options={WORK_MODES} onChange={pick('workMode')} />
          <Select label="Employment type" value={form.employmentType} options={EMPLOYMENT_TYPES} onChange={pick('employmentType')} />
          <Select label="Category" value={form.category} options={JOB_CATEGORIES} onChange={pick('category')} />
          <Select label="Experience level" value={form.experienceLevel} options={EXPERIENCE_LEVELS} onChange={pick('experienceLevel')} />
          <Input label="Minimum years of experience" name="minExperience" type="number" min="0" max="40" value={form.minExperience} onChange={set('minExperience')} error={errors.minExperience} />
        </div>
      </Section>

      <Section title="Salary (lakhs per year)">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Minimum" name="salaryMin" inputMode="decimal" value={form.salaryMin} onChange={set('salaryMin')} error={errors.salaryMin} placeholder="12" />
          <Input label="Maximum" name="salaryMax" inputMode="decimal" value={form.salaryMax} onChange={set('salaryMax')} error={errors.salaryMax} placeholder="22" />
        </div>
      </Section>

      <Section title="Description">
        <Textarea label="About the role" name="description" value={form.description} onChange={set('description')} error={errors.description} className="[&_textarea]:min-h-[9rem]" placeholder="What will this person work on, and why does it matter?" />
        <TagInput label="Required skills" values={form.skills} onChange={(v) => { setForm({ ...form, skills: v }); setErrors({ ...errors, skills: '' }); }} error={errors.skills} placeholder="React, Node.js" hint="Candidates are matched against these skills." />
        <Textarea label="Responsibilities" name="responsibilities" value={form.responsibilities} onChange={set('responsibilities')} hint="One per line" />
        <Textarea label="Qualifications" name="qualifications" value={form.qualifications} onChange={set('qualifications')} hint="One per line" />
        <Textarea label="Benefits" name="benefits" value={form.benefits} onChange={set('benefits')} hint="One per line" />
      </Section>

      {editing && (
        <Section title="Visibility">
          <Select label="Status" value={form.status} options={[{ value: 'active', label: 'Active, accepting applications' }, { value: 'closed', label: 'Closed' }]} onChange={pick('status')} />
        </Section>
      )}

      <div className="flex justify-end gap-3">
        <Button to="/recruiter/jobs" variant="ghost">Cancel</Button>
        <Button type="submit" size="lg" loading={busy}>{editing ? 'Save changes' : 'Publish job'}</Button>
      </div>
    </form>
  );
}
