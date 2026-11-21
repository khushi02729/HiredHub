import { Eye, EyeOff } from 'lucide-react';

export default function PasswordToggle({ shown, onToggle }) {
  return (
    <button type="button" onClick={onToggle} aria-label={shown ? 'Hide password' : 'Show password'} className="rounded-lg p-2 text-slate-400 hover:text-slate-700">
      {shown ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );
}
