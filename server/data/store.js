/**
 * Offline fallback store for AquaMind HIC.
 * Used automatically by supabaseStore when Supabase is unreachable, so the
 * dashboard keeps working (with clearly-flagged synthetic TN data) during
 * outages or local development without DB access. Every accessor returns the
 * same shape as its live counterpart in src/supabaseStore.js.
 */
const { geoCache } = require('./geo');

const nowISO = () => new Date().toISOString();
const isoDate = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

// deterministic pseudo-random in [0, 1) so values are stable across restarts
const rand = seed => { const x = Math.sin(seed * 9301 + 49297) * 233280; return x - Math.floor(x); };
const round = (v, d = 1) => +v.toFixed(d);

const statusFor = ({ ph, dissolved_oxygen: dox, turbidity }) => {
  if (dox < 4 || ph < 6.0 || ph > 9.0) return 'crit';
  if (dox < 5 || ph < 6.5 || ph > 8.5 || turbidity > 25) return 'warn';
  return 'ok';
};

// ---------- seed data ----------
const LAKES = Object.entries(geoCache).map(([name, g], i) => {
  const id = i + 1;
  const r = rand(id);
  const reading = {
    ph:               round(6.6 + rand(id * 3) * 2.2),
    dissolved_oxygen: round(3.2 + rand(id * 5) * 5.0),
    turbidity:        round(2 + r * 42),
    water_level_m:    round(1 + rand(id * 7) * 9)
  };
  return {
    id,
    name,
    city: g.district,
    state: 'TN',
    area_km2: g.area,
    status: statusFor(reading),
    metricValue: reading.turbidity,
    lat: g.lat,
    lon: g.lon,
    ...reading,
    recorded_at: new Date(Date.now() - Math.floor(r * 3600000)).toISOString()
  };
});

let nextActionId = 1;
const INCIDENTS = LAKES.filter(l => l.status !== 'ok').map(l => ({
  id: `ACT-${nextActionId++}`,
  lake: l.name,
  severity: l.status === 'crit' ? 'crit' : 'warn',
  title: l.dissolved_oxygen < 5 ? 'Low dissolved oxygen' : l.turbidity > 25 ? 'Turbidity spike' : 'pH out of range',
  status: 'Open',
  openedAt: new Date(Date.now() - Math.floor(rand(l.id * 11) * 6 * 3600000)).toISOString()
}));

const SPECIES = ['Catla catla', 'Labeo rohita', 'Channa striata', 'Puntius sarana', 'Etroplus suratensis'];

const PATCHABLE = ['status', 'severity', 'team', 'title'];

module.exports = {
  metrics: async () => {
    const totalLakes = LAKES.length;
    const open = INCIDENTS.filter(i => i.status !== 'Resolved').length;
    return {
      totalLakes,
      sensorsOnline: totalLakes * 3 - 2,
      sensorsTotal: totalLakes * 3,
      openIncidents: open,
      ecoIndex: LAKES.reduce((s, l) => s + (l.status === 'ok' ? 85 : l.status === 'warn' ? 60 : 35), 0) / totalLakes,
      compliancePct: LAKES.filter(l => l.status === 'ok').length / totalLakes * 100,
      alertsToday: open,
      ts: nowISO()
    };
  },

  lakes: async () => LAKES,
  lake: async id => {
    const lake = LAKES.find(l => String(l.id) === String(id));
    if (!lake) throw { status: 404, message: 'Lake not found' };
    return { lake, sensors: (await module.exports.sensors()).filter(s => s.lakeId === lake.id) };
  },

  sensors: async () => LAKES.map(l => ({
    id: `SN-${l.id}`,
    lakeId: l.id,
    lakeName: l.name,
    type: 'Multi-parameter',
    battery: 100,
    signal: 'good',
    status: l.dissolved_oxygen < 4 ? 'crit' : 'ok',
    lastReading: l.recorded_at,
    lat: l.lat,
    lon: l.lon
  })),
  sensor: async id => {
    const s = (await module.exports.sensors()).find(x => x.id === id);
    if (!s) throw { status: 404, message: 'Sensor not found' };
    return s;
  },
  readings: async id => {
    const lake = LAKES.find(l => `SN-${l.id}` === id);
    if (!lake) throw { status: 404, message: 'Sensor not found' };
    return {
      sensorId: id,
      type: 'Multi-parameter',
      series: Array.from({ length: 24 }, (_, i) => ({
        t: new Date(Date.now() - i * 3600000).toISOString(),
        value: round(lake.ph + (rand(lake.id * 100 + i) - 0.5) * 0.6, 2)
      }))
    };
  },

  incidents: async () => INCIDENTS,
  incident: async id => {
    const inc = INCIDENTS.find(i => i.id === id);
    if (!inc) throw { status: 404, message: 'Incident not found' };
    return inc;
  },
  createIncident: async body => {
    if (!body || !body.lake || !body.title) throw { status: 400, message: 'lake and title are required' };
    const inc = {
      id: `ACT-${nextActionId++}`,
      lake: body.lake,
      severity: ['crit', 'warn', 'info'].includes(body.severity) ? body.severity : 'info',
      title: body.title,
      status: 'Open',
      openedAt: nowISO()
    };
    INCIDENTS.unshift(inc);
    return inc;
  },
  patchIncident: async (id, body) => {
    const inc = INCIDENTS.find(i => i.id === id);
    if (!inc) throw { status: 404, message: 'Incident not found' };
    PATCHABLE.forEach(k => { if (body && body[k] !== undefined) inc[k] = body[k]; });
    return inc;
  },

  forecasts: async () => Array.from({ length: 7 }, (_, d) => ({
    date: isoDate(d + 1),
    do_mgL: round(6.5 + Math.sin(d / 2) * 0.8, 2),
    ph: round(7.2 + Math.cos(d / 3) * 0.3, 2),
    turbidity_ntu: 4.0,
    level_m: round(1.1 + Math.sin(d / 4) * 0.15, 2)
  })),

  anomalies: async () => {
    const out = [];
    LAKES.forEach(l => {
      if (l.ph < 6.5 || l.ph > 8.5) out.push({ id: `AN-${l.id}-PH`, sensorId: `SN-${l.id}`, lakeName: l.name, type: 'pH', deviation: l.ph, detectedAt: l.recorded_at });
      if (l.dissolved_oxygen < 5) out.push({ id: `AN-${l.id}-DO`, sensorId: `SN-${l.id}`, lakeName: l.name, type: 'DO', deviation: l.dissolved_oxygen, detectedAt: l.recorded_at });
    });
    return out;
  },

  biodiversity: async () => LAKES.filter(l => l.dissolved_oxygen < 5).map((l, i) => ({
    species: SPECIES[i % SPECIES.length],
    count: Math.round(50 + rand(l.id * 13) * 900),
    lake: l.name,
    trend: `at ${l.name}`
  })),

  maintenance: async () => [],
  optimize: async () => [],
  recovery: async () => LAKES.filter(l => l.status !== 'ok').slice(0, 6).map(l => ({
    id: `REV-${l.id}`,
    lake: l.name,
    stage: l.dissolved_oxygen < 5 ? 'Aeration & desilting' : 'Bund strengthening & weed removal',
    pct: Math.round(15 + rand(l.id * 17) * 80)
  })),
  emergency: async () => INCIDENTS
    .filter(i => i.severity === 'crit' && i.status !== 'Resolved')
    .map(i => ({ id: `EM-${i.id.replace('ACT-', '')}`, severity: 'crit', title: `${i.lake} - ${i.title}`, ts: i.openedAt })),
  reports: async () => [],
  citizen: async () => []
};
