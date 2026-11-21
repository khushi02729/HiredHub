import { Compass } from 'lucide-react';
import EmptyState from '../components/common/EmptyState';
import useDocumentTitle from '../hooks/useDocumentTitle';

export default function NotFound() {
  useDocumentTitle('Page not found');
  return (
    <div className="grid min-h-screen place-items-center bg-surface p-4">
      <div className="card w-full max-w-md">
        <EmptyState icon={Compass} title="We can't find that page" description="The link may be broken, or the page may have moved." action={{ label: 'Go to home', to: '/' }} />
      </div>
    </div>
  );
}
