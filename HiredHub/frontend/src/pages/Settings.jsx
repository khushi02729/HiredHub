import { useState } from 'react';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import PasswordToggle from './auth/PasswordToggle';
import useAuth from '../hooks/useAuth';
import useDocumentTitle from '../hooks/useDocumentTitle';
import { errorMessage } from '../services/api';
import { changePassword } from '../services/profileService';
import { formatDate } from '../utils/format';
import { passwordStrength } from '../utils/validators';

const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];

// Shared by job seekers and recruiters
export default function Settings() {
  useDocumentTitle('Settings');
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: '' }); };

  const submit = async (ev) => {
    ev.preventDefault();
    const next = {};
    if (!form.currentPassword) next.currentPassword = 'Enter your current password';
    if (form.newPassword.length < 8) next.newPassword = 'Use at least 8 characters';
    else if (form.newPassword === form.currentPassword) next.newPassword = 'Choose a password you have not used here';
    if (form.confirm !== form.newPassword) next.confirm = 'The passwords do not match';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      const message = errorMessage(err);
      if (/current password/i.test(message)) setErrors({ currentPassword: message }); else toast.error(message);
    } finally { setBusy(false); }
  };

  const toggle = <PasswordToggle shown={show} onToggle={() => setShow(!show)} />;
  const type = show ? 'text' : 'password';

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your account and password.</p>
      </div>

      <section className="card p-6">
        <h2 className="font-bold">Account</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div><dt className="text-slate-500">Email</dt><dd className="mt-0.5 truncate font-semibold">{user.email}</dd></div>
          <div><dt className="text-slate-500">Account type</dt><dd className="mt-0.5 font-semibold">{user.role === 'seeker' ? 'Job seeker' : 'Recruiter'}</dd></div>
          <div><dt className="text-slate-500">Member since</dt><dd className="mt-0.5 font-semibold">{formatDate(user.createdAt)}</dd></div>
        </dl>
      </section>

      <form onSubmit={submit} noValidate className="card space-y-4 p-6">
        <h2 className="font-bold">Change password</h2>
        <Input label="Current password" name="currentPassword" type={type} autoComplete="current-password" icon={Lock} value={form.currentPassword} onChange={set('currentPassword')} error={errors.currentPassword} right={toggle} />
        <Input label="New password" name="newPassword" type={type} autoComplete="new-password" icon={Lock} value={form.newPassword} onChange={set('newPassword')} error={errors.newPassword} right={toggle}
          hint={form.newPassword ? `Strength: ${STRENGTH[passwordStrength(form.newPassword)]}` : 'At least 8 characters'} />
        <Input label="Confirm new password" name="confirm" type={type} autoComplete="new-password" icon={Lock} value={form.confirm} onChange={set('confirm')} error={errors.confirm} />
        <Button type="submit" loading={busy}>Update password</Button>
      </form>
    </div>
  );
}
