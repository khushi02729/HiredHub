import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-brand text-white shadow-sm hover:shadow-lift hover:brightness-110',
  secondary: 'bg-white text-ink border border-slate-200 hover:border-primary-300 hover:text-primary-700',
  soft: 'bg-primary-50 text-primary-700 hover:bg-primary-100',
  ghost: 'text-slate-600 hover:bg-slate-100',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  light: 'bg-white text-primary-700 hover:bg-primary-50',
};
const sizes = { sm: 'h-9 px-3.5 text-sm', md: 'h-11 px-5 text-sm', lg: 'h-12 px-6 text-base' };

// Renders a router <Link> when `to` is given, otherwise a <button>.
export default function Button({ to, variant = 'primary', size = 'md', loading = false, icon: Icon, className = '', children, ...props }) {
  const cls = `inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-60 ${variants[variant]} ${sizes[size]} ${className}`;
  if (to) {
    return <Link to={to} className={cls} {...props}>{Icon && <Icon size={18} />}{children}</Link>;
  }
  return (
    <button type="button" {...props} className={cls} disabled={loading || props.disabled}>
      {loading ? <Loader2 size={18} className="animate-spin" /> : Icon && <Icon size={18} />}
      {children}
    </button>
  );
}
