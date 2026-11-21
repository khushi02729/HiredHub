export default function Textarea({ label, error, hint, id, className = '', maxLength, value = '', ...props }) {
  const textId = id || props.name;
  return (
    <div className={className}>
      {label && <label htmlFor={textId} className="mb-1.5 block text-sm font-semibold text-slate-700">{label}</label>}
      <textarea id={textId} value={value} maxLength={maxLength} aria-invalid={!!error}
        className={`input h-auto min-h-[7rem] resize-y py-2.5 ${error ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''}`} {...props} />
      <div className="mt-1.5 flex justify-between gap-3 text-xs">
        <span className={error ? 'font-medium text-rose-600' : 'text-slate-500'}>{error || hint}</span>
        {maxLength && <span className="text-slate-400">{value.length}/{maxLength}</span>}
      </div>
    </div>
  );
}
