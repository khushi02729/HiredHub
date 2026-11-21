import { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2 } from 'lucide-react';
import AvatarUploader from '../../components/common/AvatarUploader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import TagInput from '../../components/common/TagInput';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { updateProfile } from '../../services/profileService';
import { lpaToRupees, rupeesToLpa } from '../../utils/format';
import { isEmail } from '../../utils/validators';

const blankEdu = () => ({ school: '', degree: '', field: '', startYear: '', endYear: '' });
const isUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; } };
const Section = ({ title, hint, children }) => (
  <section className="card p-6">
    <h2 className="font-bold">{title}</h2>
    {hint && <p className="mt-0.5 text-sm text-slate-500">{hint}</p>}
    <div className="mt-5 space-y-4">{children}</div>
  </section>
);

export default function Profile() {
  useDocumentTitle('Profile');
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(() => ({
    name: user.name || '', email: user.email || '', phone: user.phone || '', headline: user.headline || '',
    skills: user.skills || [], experienceYears: user.experienceYears ?? 0, expectedSalary: rupeesToLpa(user.expectedSalary),
    preferredLocations: user.preferredLocations || [],
    education: (user.education || []).map((e) => ({ school: e.school || '', degree: e.degree || '', field: e.field || '', startYear: e.startYear ?? '', endYear: e.endYear ?? '' })),
    linkedin: user.linkedin || '', github: user.github || '', portfolio: user.portfolio || '',
  }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: '' }); };
  const setEdu = (i, k, v) => setForm({ ...form, education: form.education.map((e, n) => (n === i ? { ...e, [k]: v } : e)) });

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Enter your full name';
    if (!isEmail(form.email)) e.email = 'Enter a valid email address';
    if (form.phone && !/^[+\d][\d\s-]{6,17}$/.test(form.phone.trim())) e.phone = 'Enter a valid phone number';
    const years = Number(form.experienceYears);
    if (form.experienceYears === '' || Number.isNaN(years) || years < 0 || years > 60) e.experienceYears = 'Enter a number between 0 and 60';
    if (form.expectedSalary && !/^\d+(\.\d{1,2})?$/.test(form.expectedSalary)) e.expectedSalary = 'Enter lakhs per year, for example 18 or 12.5';
    ['linkedin', 'github', 'portfolio'].forEach((k) => { if (form[k] && !isUrl(form[k].trim())) e[k] = 'Enter a full link starting with https://'; });
    form.education.forEach((ed, i) => {
      const s = Number(ed.startYear); const en = Number(ed.endYear);
      if (ed.startYear && (s < 1950 || s > 2100)) e[`edu${i}`] = 'Enter a valid start year';
      else if (ed.endYear && (en < 1950 || en > 2100)) e[`edu${i}`] = 'Enter a valid end year';
      else if (ed.startYear && ed.endYear && s > en) e[`edu${i}`] = 'The start year cannot be after the end year';
    });
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) { toast.error('Fix the highlighted fields'); return; }
    setBusy(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), headline: form.headline.trim(),
        skills: form.skills, preferredLocations: form.preferredLocations, experienceYears: Number(form.experienceYears),
        expectedSalary: form.expectedSalary ? lpaToRupees(form.expectedSalary) : null,
        linkedin: form.linkedin.trim(), github: form.github.trim(), portfolio: form.portfolio.trim(),
        education: form.education.filter((e) => e.school.trim() || e.degree.trim()).map((e) => ({
          school: e.school.trim(), degree: e.degree.trim(), field: e.field.trim(),
          startYear: e.startYear ? Number(e.startYear) : null, endYear: e.endYear ? Number(e.endYear) : null,
        })),
      });
      setUser(updated);
      toast.success('Profile saved');
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Profile</h1>
        <p className="mt-1 text-slate-600">Your skills, experience and preferred locations drive your job match scores.</p>
      </div>

      <Section title="Basic details">
        <AvatarUploader />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" name="name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Email" name="email" type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Phone" name="phone" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+91 98765 43210" />
          <Input label="Headline" name="headline" value={form.headline} onChange={set('headline')} maxLength={120} placeholder="Full stack developer" />
        </div>
      </Section>

      <Section title="Skills and experience" hint="Skills are matched against each job's required skills, ignoring capitalisation.">
        <TagInput label="Skills" values={form.skills} onChange={(v) => setForm({ ...form, skills: v })} placeholder="React, Python, SQL" max={50} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Years of experience" name="experienceYears" type="number" min="0" max="60" step="0.5" value={form.experienceYears} onChange={set('experienceYears')} error={errors.experienceYears} />
          <Input label="Expected salary (lakhs per year)" name="expectedSalary" inputMode="decimal" value={form.expectedSalary} onChange={set('expectedSalary')} error={errors.expectedSalary} placeholder="18" />
        </div>
        <TagInput label="Preferred locations" values={form.preferredLocations} onChange={(v) => setForm({ ...form, preferredLocations: v })} placeholder="Bengaluru, Remote" max={20} hint="Add Remote if you are open to remote roles." />
      </Section>

      <Section title="Education">
        {form.education.length === 0 && <p className="text-sm text-slate-500">No education added yet.</p>}
        {form.education.map((ed, i) => (
          <div key={i} className="rounded-xl border border-slate-200 p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="School or university" name={`school${i}`} value={ed.school} onChange={(e) => setEdu(i, 'school', e.target.value)} />
              <Input label="Degree" name={`degree${i}`} value={ed.degree} onChange={(e) => setEdu(i, 'degree', e.target.value)} placeholder="B.Tech" />
              <Input label="Field of study" name={`field${i}`} value={ed.field} onChange={(e) => setEdu(i, 'field', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="From" name={`start${i}`} inputMode="numeric" value={ed.startYear} onChange={(e) => setEdu(i, 'startYear', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2018" />
                <Input label="To" name={`end${i}`} inputMode="numeric" value={ed.endYear} onChange={(e) => setEdu(i, 'endYear', e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="2022" />
              </div>
            </div>
            {errors[`edu${i}`] && <p className="mt-2 text-xs font-medium text-rose-600">{errors[`edu${i}`]}</p>}
            <Button variant="ghost" size="sm" icon={Trash2} className="mt-3 text-rose-600 hover:bg-rose-50" onClick={() => setForm({ ...form, education: form.education.filter((_, n) => n !== i) })}>Remove</Button>
          </div>
        ))}
        <Button variant="secondary" size="sm" icon={Plus} onClick={() => setForm({ ...form, education: [...form.education, blankEdu()] })}>Add education</Button>
      </Section>

      <Section title="Links">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={set('linkedin')} error={errors.linkedin} placeholder="https://linkedin.com/in/you" />
          <Input label="GitHub" name="github" value={form.github} onChange={set('github')} error={errors.github} placeholder="https://github.com/you" />
          <Input label="Portfolio" name="portfolio" value={form.portfolio} onChange={set('portfolio')} error={errors.portfolio} placeholder="https://yoursite.dev" className="sm:col-span-2" />
        </div>
      </Section>

      <div className="sticky bottom-4 flex justify-end"><Button type="submit" size="lg" loading={busy} className="shadow-lift">Save profile</Button></div>
    </form>
  );
}
