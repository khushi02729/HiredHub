import { forwardRef } from 'react';

const Input = forwardRef(function Input({ label, error, hint, icon: Icon, right, id, className = '', ...props }, ref) {
  const inputId = id || props.name;
  return (
    <div className={className}>
      {label && <label htmlFor={inputId} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <div className="relative">
        {Icon && <Icon size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`input ${Icon ? 'pl-10' : ''} ${right ? 'pr-11' : ''} ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`}
          {...props}
        />
        {right && <div className="absolute right-1.5 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
      {error ? <p id={`${inputId}-error`} className="mt-1.5 text-xs font-medium text-rose-600">{error}</p>
        : hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
    </div>
  );
});

export default Input;
