import { Briefcase } from 'lucide-react';

export default function Logo({ light = false, className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 font-extrabold tracking-tight ${light ? 'text-white' : 'text-ink'} ${className}`}>
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${light ? 'bg-white/15 ring-1 ring-white/30' : 'bg-brand shadow-lift'}`}>
        <Briefcase size={19} className="text-white" />
      </span>
      <span className="text-xl">HiredHub</span>
    </span>
  );
}
