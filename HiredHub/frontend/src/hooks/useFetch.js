import { useEffect, useState } from 'react';
import { errorMessage } from '../services/api';

// Runs `fetcher` whenever `deps` change. setData accepts a value or an updater, for optimistic edits.
export default function useFetch(fetcher, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let ignore = false;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher()
      .then((data) => { if (!ignore) setState({ data, loading: false, error: '' }); })
      .catch((err) => { if (!ignore) setState({ data: null, loading: false, error: errorMessage(err) }); });
    return () => { ignore = true; };
  }, [...deps, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    reload: () => setTick((t) => t + 1),
    setData: (next) => setState((s) => ({ ...s, data: typeof next === 'function' ? next(s.data) : next })),
  };
}
