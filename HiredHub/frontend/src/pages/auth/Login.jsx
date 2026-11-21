import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail } from 'lucide-react';
import AuthLayout from './AuthLayout';
import RoleTabs from './RoleTabs';
import PasswordToggle from './PasswordToggle';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import useAuth from '../../hooks/useAuth';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { errorMessage } from '../../services/api';
import { homeFor } from '../../utils/roles';
import { isEmail } from '../../utils/validators';

const SHOW_DEMO = import.meta.env.DEV || import.meta.env.VITE_SHOW_DEMO === 'true';
const DEMO = { seeker: 'seeker@hiredhub.dev', recruiter: 'recruiter@hiredhub.dev' };

export default function Login() {
  useDocumentTitle('Log in');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [role, setRole] = useState(params.get('role') === 'recruiter' ? 'recruiter' : 'seeker');
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => { setForm({ ...form, [k]: e.target.value }); setErrors({ ...errors, [k]: '' }); setFormError(''); };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!isEmail(form.email)) next.email = 'Enter a valid email address';
    if (!form.password) next.password = 'Enter your password';
    setErrors(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    try {
      const user = await login({ email: form.email.trim(), password: form.password, role });
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(location.state?.from || homeFor(user.role), { replace: true });
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthLayout role={role} title="Welcome back" subtitle="Log in to continue where you left off.">
      <RoleTabs value={role} onChange={(r) => { setRole(r); setFormError(''); }} />
      <form onSubmit={submit} noValidate className="mt-6 space-y-4">
        <Input label="Email" name="email" type="email" autoComplete="email" icon={Mail} value={form.email} onChange={set('email')} error={errors.email} placeholder="you@example.com" />
        <Input label="Password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" icon={Lock} value={form.password} onChange={set('password')} error={errors.password}
          right={<PasswordToggle shown={show} onToggle={() => setShow(!show)} />} placeholder="Your password" />
        {formError && <p role="alert" className="rounded-xl bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">{formError}</p>}
        <Button type="submit" loading={busy} className="w-full" size="lg">Log in</Button>
      </form>

      {SHOW_DEMO && (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-3.5 text-sm text-slate-600">
          <p className="font-semibold text-ink">Demo account</p>
          <button type="button" className="mt-1 text-primary-700 hover:underline" onClick={() => { setForm({ email: DEMO[role], password: 'Password123' }); setErrors({}); setFormError(''); }}>
            Fill in the demo {role === 'seeker' ? 'job seeker' : 'recruiter'} login
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-slate-600">
        New to HiredHub? <Link to={`/register?role=${role}`} className="font-semibold text-primary-700 hover:underline">Create an account</Link>
      </p>
    </AuthLayout>
  );
}
