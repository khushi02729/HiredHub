export default function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

export function JobCardSkeleton() {
  return (
    <div className="card p-5" aria-busy="true">
      <div className="flex gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
      </div>
      <Skeleton className="mt-5 h-3 w-3/4" />
      <Skeleton className="mt-4 h-5 w-1/2" />
      <div className="mt-4 flex gap-2"><Skeleton className="h-6 w-16" /><Skeleton className="h-6 w-20" /><Skeleton className="h-6 w-14" /></div>
      <Skeleton className="mt-5 h-9 w-full" />
    </div>
  );
}
