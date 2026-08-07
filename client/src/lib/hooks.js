import { useEffect, useState, useCallback } from 'react';

/**
 * useApi — small data-fetching hook.
 * Returns { data, error, loading }. Refetches when `deps` change.
 */
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const [tick, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const refetch = useCallback(() => setTick(t => t + 1), []);

  useEffect(() => {
    let live = true;
    setState(s => ({ ...s, loading: true }));
    Promise.resolve()
      .then(fn)
      .then(data => live && setState({ data, error: null, loading: false }))
      .catch(error => live && setState({ data: null, error, loading: false }));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, refetch };
}

/** Random-but-stable ID for DOM keys. */
export const rid = () => Math.random().toString(36).slice(2, 8);

/** Severity → pill class. */
export const pill = sev => {
  if (!sev) return 'pill';
  const s = String(sev).toLowerCase();
  if (s === 'crit' || s === 'critical') return 'pill crit';
  if (s === 'warn' || s === 'high' || s === 'warning') return 'pill warn';
  if (s === 'ok'   || s === 'closed' || s === 'healthy' || s === 'filed' || s === 'submitted') return 'pill ok';
  if (s === 'med'  || s === 'moderate' || s === 'review') return 'pill mod';
  return 'pill info';
};