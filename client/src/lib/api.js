/**
 * Tiny REST client. Centralises the API base URL and JSON handling.
 * In dev, Vite proxies /api → http://127.0.0.1:4000 (see vite.config.js).
 * In production, the same /api path is served by the Node backend.
 */

const BASE = ''; // same-origin

async function request(path, { method = 'GET', body } = {}) {
  const opts = {
    method,
    headers: { Accept: 'application/json' },
  };
  if (body !== undefined) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  const r = await fetch(BASE + path, opts);
  if (!r.ok) {
    let msg = `HTTP ${r.status}`;
    try { msg = (await r.json()).error || msg; } catch { /* ignore */ }
    throw new Error(msg);
  }
  return r.json();
}

export const api = {
  metrics:      () => request('/api/metrics'),
  lakes:        () => request('/api/lakes'),
  lake:         (id) => request('/api/lakes/' + encodeURIComponent(id)),
  sensors:      () => request('/api/sensors'),
  sensor:       (id) => request('/api/sensors/' + encodeURIComponent(id)),
  readings:     (id) => request('/api/sensors/' + encodeURIComponent(id) + '/readings'),
  incidents:    () => request('/api/incidents'),
  createIncident: (b) => request('/api/incidents', { method: 'POST', body: b }),
  patchIncident:  (id, b) => request('/api/incidents/' + encodeURIComponent(id), { method: 'PATCH', body: b }),
  anomalies:    () => request('/api/anomalies'),
  forecasts:    () => request('/api/forecasts'),
  biodiversity: () => request('/api/biodiversity'),
  maintenance:  () => request('/api/maintenance'),
  optimize:     () => request('/api/optimize'),
  recovery:     () => request('/api/recovery'),
  emergency:    () => request('/api/emergency'),
  reports:      () => request('/api/reports'),
  citizen:      () => request('/api/citizen'),
  getModels:    () => request('/api/assistant/models'),
  assistant:    (prompt, model) => request('/api/assistant', { method: 'POST', body: { prompt, model } }),
  health:       () => request('/api/health')
};