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

/** Water-quality index (0–100) from a lake's live readings. Falls back to
 *  the turbidity-based metricValue when individual parameters are missing. */
export const wqiOf = l => {
  if (!l) return 0;
  if (l.ph == null && l.dissolved_oxygen == null && l.turbidity == null) {
    return Math.max(0, Math.min(100, 100 - (l.metricValue || 0) * 1.2));
  }
  let score = 100;
  if (l.ph != null) score -= Math.abs(l.ph - 7.2) * 12;
  if (l.dissolved_oxygen != null) score -= Math.max(0, 7 - l.dissolved_oxygen) * 9;
  if (l.turbidity != null) score -= l.turbidity * 0.7;
  return Math.max(0, Math.min(100, score));
};

export const statusLabel = s => (s === 'crit' ? 'Critical' : s === 'warn' ? 'At Risk' : 'Healthy');

/** WQI for one forecast point ({ do_mgL, ph, turbidity_ntu }). */
export const forecastWqi = f => wqiOf({ ph: f.ph, dissolved_oxygen: f.do_mgL, turbidity: f.turbidity_ntu });

/** Scale a numeric series into SVG polyline points spanning width × [top, bottom],
 *  auto-ranged to the data (±pad) so small variations stay visible. */
export function toPolyline(values, { width = 600, x0 = 0, top = 20, bottom = 200, pad = 5 } = {}) {
  if (!values.length) return { points: '', y: () => bottom };
  const lo = Math.min(...values) - pad;
  const hi = Math.max(...values) + pad;
  const y = v => bottom - ((v - lo) / (hi - lo)) * (bottom - top);
  const step = width / Math.max(1, values.length - 1);
  const points = values.map((v, i) => `${(x0 + i * step).toFixed(1)},${y(v).toFixed(1)}`).join(' ');
  return { points, y, step };
}
