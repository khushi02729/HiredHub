import Button from './Button';

export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center px-6 py-14 text-center ${className}`}>
      {Icon && <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary-50 text-primary-600"><Icon size={26} /></div>}
      <h3 className="text-lg font-bold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <Button className="mt-5" {...action}>{action.label}</Button>}
    </div>
  );
}
