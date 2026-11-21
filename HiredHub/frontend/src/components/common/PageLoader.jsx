import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="grid min-h-[60vh] place-items-center" role="status" aria-label="Loading">
      <Loader2 size={32} className="animate-spin text-primary-600" />
    </div>
  );
}
