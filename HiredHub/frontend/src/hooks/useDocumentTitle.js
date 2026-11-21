import { useEffect } from 'react';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | HiredHub` : 'HiredHub – Job Portal and Application Tracker';
  }, [title]);
}
