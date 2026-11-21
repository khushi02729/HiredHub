import { useState } from 'react';
import toast from 'react-hot-toast';
import AvatarUploader from '../../components/common/AvatarUploader';
import Button from '../../components/common/Button';
import { Select } from '../../components/common/Dropdown';
import Input from '../../components/common/Input';
import Textarea from '../../components/common/Textarea';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { updateProfile } from '../../services/profileService';
import { COMPANY_SIZES } from '../../utils/constants';

const isUrl = (v) => { try { return ['http:', 'https:'].includes(new URL(v).protocol); } catch { return false; } };

export default function CompanyProfile() {
  useDocumentTitle('Company profile');
  const { user, setUser } = useAuth();
  const c = user.company || {};
  const [form, setForm] = useState({ name: user.name || '', headline: user.headline || '', phone: user.phone || '', companyName: c.name || '', website: c.website || '', logo: c.logo || '', size: c.size || '', about: c.about || '' });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: '' }); };

  const submit = async (ev) => {
    ev.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your name';
    if (form.phone && !/^[+\d][\d\s-]{6,17}$/.test(form.phone.trim())) next.phone = 'Enter a valid phone number';
    if (!form.companyName.trim()) next.companyName = 'Enter your company name';
    if (form.website && !isUrl(form.website.trim())) next.website = 'Enter a full link starting with https://';
    if (form.logo && !isUrl(form.logo.trim())) next.logo = 'Enter a full image link starting with https://';
    setErrors(next);
    if (Object.keys(next).length) { toast.error('Fix the highlighted fields'); return; }
    setBusy(true);
    try {
      setUser(await updateProfile({
        name: form.name.trim(), headline: form.headline.trim(), phone: form.phone.trim(),
        company: { name: form.companyName.trim(), website: form.website.trim(), logo: form.logo.trim(), size: form.size, about: form.about.trim() },
      }));
      toast.success('Profile saved. Your jobs now show the updated company details.');
    } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
  };

  return (
    <form onSubmit={submit} noValidate className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Company profile</h1>
        <p className="mt-1 text-slate-600">Candidates see these details on your job listings.</p>
      </div>
      <section className="card space-y-4 p-6">
        <h2 className="font-bold">Your details</h2>
        <AvatarUploader />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Full name" name="name" value={form.name} onChange={set('name')} error={errors.name} />
          <Input label="Role at the company" name="headline" value={form.headline} onChange={set('headline')} placeholder="Talent lead" />
          <Input label="Phone" name="phone" value={form.phone} onChange={set('phone')} error={errors.phone} placeholder="+91 98765 43210" />
        </div>
      </section>
      <section className="card space-y-4 p-6">
        <h2 className="font-bold">Company</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Company name" name="companyName" value={form.companyName} onChange={set('companyName')} error={errors.companyName} />
          <Select label="Company size" value={form.size} options={COMPANY_SIZES} anyLabel="Not specified" onChange={(v) => setForm({ ...form, size: v })} />
          <Input label="Website" name="website" value={form.website} onChange={set('website')} error={errors.website} placeholder="https://example.com" />
          <Input label="Logo link" name="logo" value={form.logo} onChange={set('logo')} error={errors.logo} placeholder="https://example.com/logo.png" hint="Leave empty to show initials" />
        </div>
        <Textarea label="About the company" name="about" value={form.about} onChange={set('about')} maxLength={1000} />
      </section>
      <div className="flex justify-end"><Button type="submit" size="lg" loading={busy}>Save profile</Button></div>
    </form>
  );
}
