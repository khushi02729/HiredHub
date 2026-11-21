import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Building2, Lock, Mail, User } from 'lucide-react';
import AuthLayout from './AuthLayout';
import RoleTabs from './RoleTabs';
import PasswordToggle from './PasswordToggle';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { homeFor } from '../../utils/roles';
import { isEmail, passwordStrength } from '../../utils/validators';

const STRENGTH = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
const BAR = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-emerald-400', 'bg-emerald-600'];

export default function Register() {
  useDocumentTitle('Create account');
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'recruiter' ? 'recruiter' : 'seeker');
  const [form, setForm] = useState({ name: '', email: '', password: '', companyName: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const strength = passwordStrength(form.password);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: '' }); setFormError(''); };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Enter your full name';
    if (!isEmail(form.email)) next.email = 'Enter a valid email address';
    if (form.password.length < 8) next.password = 'Use at least 8 characters';
    if (role === 'recruiter' && !form.companyName.trim()) next.companyName = 'Enter your company name';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const user = await register({
        name: form.name.trim(), email: form.email.trim(), password: form.password, role,
        ...(role === 'recruiter' ? { companyName: form.companyName.trim() } : {}),
      });
      toast.success('Your account is ready');
      navigate(homeFor(user.role), { replace: true });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout role={role} title="Create your account" subtitle={role === 'seeker' ? 'Start tracking your job search in minutes.' : 'Post your first role and meet candidates faster.'}>
      <RoleTabs value={role} onChange={(r) => { setRole(r); setErrors({}); setFormError(''); }} />
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <Input label="Full name" name="name" autoComplete="name" icon={User} value={form.name} onChange={set('name')} error={errors.name} placeholder="Aarav Mehta" />
        {role === 'recruiter' && (
          <Input label="Company name" name="companyName" autoComplete="organization" icon={Building2} value={form.companyName} onChange={set('companyName')} error={errors.companyName} placeholder="Acme Technologies" />
        )}
        <Input label="Email" name="email" type="email" autoComplete="email" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
        <div>
          <Input label="Password" name="password" type={show ? 'text' : 'password'} autoComplete="new-password" icon={Lock} value={form.password} onChange={set('password')} error={errors.password}
            right={<PasswordToggle shown={show} onToggle={() => setShow(!show)} />} placeholder="At least 8 characters" />
          {form.password && (
            <div className="mt-2 flex items-center gap-2" aria-live="polite">
              <div className="flex flex-1 gap-1">{[1, 2, 3, 4].map((n) => <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= strength ? BAR[strength] : 'bg-slate-200'}`} />)}</div>
              <span className="w-16 text-right text-xs text-slate-500">{STRENGTH[strength]}</span>
            </div>
          )}
        </div>
        {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{formError}</p>}
        <Button type="submit" loading={busy} className="w-full" size="lg">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account? <Link to={`/login?role=${role}`} className="font-semibold text-primary-700 hover:underline">Log in</Link>
      </p>
    </AuthLayout>
  );
}
