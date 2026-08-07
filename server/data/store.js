/**
 * In-memory data store for AquaMind HIC backend.
 * Holds seed data and exposes async accessors. Replace with a real DB
 * (Postgres / Mongo / etc.) by re-implementing this module's interface.
 */
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const STORE_FILE = path.join(__dirname, 'store.json');

const nowISO = () => new Date().toISOString();
const isoDate = (offsetDays = 0) => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);

// ---------- seed data ----------
const LAKES = [
  { id: 'LK-001', name: 'Sukhna Lake',   city: 'Chandigarh',  state: 'CH', area_km2: 1.53,   status: 'ok',   lat: 30.7257, lon: 76.8838 },
  { id: 'LK-002', name: 'Dal Lake',      city: 'Srinagar',    state: 'JK', area_km2: 18.0,   status: 'warn', lat: 34.1196, lon: 74.8745 },
  { id: 'LK-003', name: 'Upper Lake',    city: 'Bhopal',      state: 'MP', area_km2: 7.7,    status: 'ok',   lat: 23.2408, lon: 77.4346 },
  { id: 'LK-004', name: 'Powai Lake',    city: 'Mumbai',      state: 'MH', area_km2: 1.7,    status: 'crit', lat: 19.1176, lon: 72.9060 },
  { id: 'LK-005', name: 'Ooty Lake',     city: 'Ooty',        state: 'TN', area_km2: 0.65,   status: 'ok',   lat: 11.4064, lon: 76.6932 },
  { id: 'LK-006', name: 'Vembanad Lake', city: 'Alappuzha',   state: 'KL', area_km2: 200.0,  status: 'ok',   lat:  9.6285, lon: 76.3900 },
  { id: 'LK-007', name: 'Loktak Lake',   city: 'Bishnupur',   state: 'MN', area_km2: 287.0,  status: 'warn', lat: 24.5150, lon: 93.7820 },
  { id: 'LK-008', name: 'Chilika Lake',  city: 'Puri',        state: 'OD', area_km2: 1100.0, status: 'ok',   lat: 19.7167, lon: 85.3000 }
];

const SENSOR_TYPES = ['pH', 'Turbidity', 'DO', 'Temp', 'Conductivity', 'Level'];
const SENSORS = Array.from({ length: 24 }, (_, i) => {
  const lake = LAKES[i % LAKES.length];
  const type = SENSOR_TYPES[i % SENSOR_TYPES.length];
  const sig  = i % 5 === 0 ? 'offline' : (i % 7 === 0 ? 'weak' : 'good');
  return {
    id: `SN-${String(i + 1).padStart(3, '0')}`,
    lakeId: lake.id,
    lakeName: lake.name,
    type,
    battery: 60 + (i * 3) % 40,
    signal: sig,
    status: sig === 'offline' ? 'crit' : (sig === 'weak' ? 'warn' : 'ok'),
    lastReading: nowISO(),
    lat: lake.lat + (Math.random() - 0.5) * 0.04,
    lon: lake.lon + (Math.random() - 0.5) * 0.04
  };
});

const INCIDENTS = [
  { id: 'INC-2301', lake: 'Powai Lake',  severity: 'crit', title: 'Industrial effluent detected', status: 'open',          openedAt: nowISO() },
  { id: 'INC-2302', lake: 'Dal Lake',    severity: 'warn', title: 'Algal bloom expansion',       status: 'investigating', openedAt: nowISO() },
  { id: 'INC-2303', lake: 'Sukhna Lake', severity: 'info', title: 'Routine turbidity spike',     status: 'closed',        openedAt: nowISO() },
  { id: 'INC-2304', lake: 'Loktak Lake', severity: 'warn', title: 'Fishing-zone encroachment',   status: 'open',          openedAt: nowISO() }
];

const ANOMALIES = [
  { id: 'AN-991', sensorId: 'SN-004', type: 'Turbidity', deviation: 3.4, detectedAt: nowISO() },
  { id: 'AN-992', sensorId: 'SN-011', type: 'pH',        deviation: 1.8, detectedAt: nowISO() },
  { id: 'AN-993', sensorId: 'SN-017', type: 'DO',        deviation: 2.1, detectedAt: nowISO() }
];

const FORECASTS = Array.from({ length: 14 }, (_, d) => ({
  date: isoDate(d),
  do_mgL:           +(6.5 + Math.sin(d / 2) * 0.8).toFixed(2),
  ph:               +(7.2 + Math.cos(d / 3) * 0.3).toFixed(2),
  turbidity_ntu:    +(4 + Math.abs(Math.sin(d)) * 5).toFixed(1),
  level_m:          +(1.1 + Math.sin(d / 4) * 0.15).toFixed(2)
}));

const BIODIVERSITY = [
  { species: 'Indian Spot-billed Duck',  count: 142, trend: '+12%' },
  { species: 'Purple Heron',            count:  38, trend: '-4%'  },
  { species: 'Oriental Darter',         count:  21, trend: '+7%'  },
  { species: 'Black-headed Ibis',       count:  56, trend: '+3%'  },
  { species: 'Indian Cormorant',        count:  89, trend: '-1%'  },
  { species: 'Common Kingfisher',       count:  64, trend: '+5%'  },
  { species: 'Catla catla',             count: 220, trend: '+2%'  },
  { species: 'Labeo rohita',            count: 175, trend: '-2%'  }
];

const MAINTENANCE = [
  { id: 'WO-781', asset: 'SN-002', task: 'Replace probe membrane',  due: '2026-08-09', priority: 'high' },
  { id: 'WO-782', asset: 'SN-009', task: 'Firmware update',         due: '2026-08-12', priority: 'med'  },
  { id: 'WO-783', asset: 'BUOY-A',task: 'Re-tension mooring cable',due: '2026-08-15', priority: 'low'  }
];

const OPTIMIZE = [
  { id: 'OPT-01', lake: 'Powai Lake',  gain_pct: 18, co2_kg: 4200, status: 'ready'   },
  { id: 'OPT-02', lake: 'Dal Lake',    gain_pct: 11, co2_kg: 2200, status: 'queued'  },
  { id: 'OPT-03', lake: 'Sukhna Lake', gain_pct:  9, co2_kg: 1600, status: 'running' }
];

const RECOVERY = [
  { id: 'RC-12', lake: 'Powai Lake',  stage: 'Sediment dredging', pct:  62 },
  { id: 'RC-13', lake: 'Loktak Lake', stage: 'Phytoremediation',  pct:  34 },
  { id: 'RC-14', lake: 'Dal Lake',    stage: 'Aeration trials',   pct:  18 }
];

const EMERGENCY = [
  { id: 'EM-1', severity: 'crit', title: 'Powai critical DO reading',         ts: nowISO() },
  { id: 'EM-2', severity: 'crit', title: 'Industrial discharge — Powai Lake', ts: nowISO() },
  { id: 'EM-3', severity: 'warn', title: 'Algal bloom — Dal Lake expansion',  ts: nowISO() },
  { id: 'EM-4', severity: 'info', title: 'Sensor cluster offline — Sukhna',   ts: nowISO() }
];

const REPORTS = [
  { id: 'RPT-2026-Q2', title: 'Quarterly Water-Quality Summary', period: 'Q2-2026', pages: 42 },
  { id: 'RPT-2026-07', title: 'July Compliance Filing',           period: '2026-07', pages: 18 }
];

const CITIZEN = [
  { id: 'CT-441', name: 'R. Sharma', topic: 'Foam at Powai Lake',          status: 'open'   },
  { id: 'CT-442', name: 'A. Khan',   topic: 'Dead fish near Sukhna',       status: 'triaged' },
  { id: 'CT-443', name: 'M. Iqbal',  topic: 'Bad odour — Dal Lake ghat',   status: 'closed' }
];

const METRICS = () => ({
  totalLakes:    LAKES.length,
  sensorsOnline: SENSORS.filter(s => s.signal === 'good').length,
  sensorsTotal:  SENSORS.length,
  openIncidents: INCIDENTS.filter(i => i.status !== 'closed').length,
  ecoIndex:      72.4,
  compliancePct: 94.1,
  alertsToday:   11,
  ts:            nowISO()
});

let _state = {
  LAKES, SENSORS, INCIDENTS, ANOMALIES, FORECASTS,
  BIODIVERSITY, MAINTENANCE, OPTIMIZE, RECOVERY, EMERGENCY, REPORTS, CITIZEN
};

// Load from disk if available
try {
  if (fs.existsSync(STORE_FILE)) {
    _state = JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    // Update local references
    LAKES.splice(0, LAKES.length, ..._state.LAKES);
    SENSORS.splice(0, SENSORS.length, ..._state.SENSORS);
    INCIDENTS.splice(0, INCIDENTS.length, ..._state.INCIDENTS);
    ANOMALIES.splice(0, ANOMALIES.length, ..._state.ANOMALIES);
    FORECASTS.splice(0, FORECASTS.length, ..._state.FORECASTS);
    BIODIVERSITY.splice(0, BIODIVERSITY.length, ..._state.BIODIVERSITY);
    MAINTENANCE.splice(0, MAINTENANCE.length, ..._state.MAINTENANCE);
    OPTIMIZE.splice(0, OPTIMIZE.length, ..._state.OPTIMIZE);
    RECOVERY.splice(0, RECOVERY.length, ..._state.RECOVERY);
    EMERGENCY.splice(0, EMERGENCY.length, ..._state.EMERGENCY);
    REPORTS.splice(0, REPORTS.length, ..._state.REPORTS);
    CITIZEN.splice(0, CITIZEN.length, ..._state.CITIZEN);
  }
} catch (e) {
  console.error("Failed to load store.json", e);
}

const saveStore = () => {
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(_state, null, 2), 'utf-8');
  } catch (e) {
    console.error("Failed to save store.json", e);
  }
};


// ---------- async accessors (mirror async DB calls) ----------
const sleep = (ms = 0) => new Promise(r => setTimeout(r, ms));
const all = (xs, ms = 5) => Promise.resolve(sleep(ms)).then(() => xs);

module.exports = {
  // metrics
  metrics: () => all(METRICS()),
  // lakes
  lakes:   () => all(LAKES),
  lake:    id => { const l = LAKES.find(x => x.id === id); return l ? all({ lake: l, sensors: SENSORS.filter(s => s.lakeId === id) }) : Promise.reject({ status: 404, message: 'Lake not found' }); },
  // sensors
  sensors: () => all(SENSORS),
  sensor:  id => { const s = SENSORS.find(x => x.id === id); return s ? all(s) : Promise.reject({ status: 404, message: 'Sensor not found' }); },
  readings: id => {
    const sensor = SENSORS.find(x => x.id === id);
    if (!sensor) return Promise.reject({ status: 404, message: 'Sensor not found' });
    const series = Array.from({ length: 24 }, (_, i) => ({
      t: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
      value: +(Math.random() * 10).toFixed(2)
    }));
    return all({ sensorId: id, type: sensor.type, series });
  },
  // incidents
  incidents: () => all(INCIDENTS),
  incident:  id => { const i = INCIDENTS.find(x => x.id === id); return i ? all(i) : Promise.reject({ status: 404, message: 'Incident not found' }); },
  createIncident: body => {
    if (!body || !body.lake || !body.title) return Promise.reject({ status: 400, message: 'lake and title are required' });
    const inc = {
      id: 'INC-' + nanoid(6).toUpperCase(),
      lake: body.lake,
      severity: body.severity || 'info',
      title: body.title,
      status: 'open',
      openedAt: nowISO()
    };
    INCIDENTS.unshift(inc);
    saveStore();
    return all(inc);
  },
  patchIncident: (id, body) => {
    const inc = INCIDENTS.find(x => x.id === id);
    if (!inc) return Promise.reject({ status: 404, message: 'Incident not found' });
    Object.assign(inc, body || {});
    saveStore();
    return all(inc);
  },
  // other
  anomalies:    () => all(ANOMALIES),
  forecasts:    () => all(FORECASTS),
  biodiversity: () => all(BIODIVERSITY),
  maintenance:  () => all(MAINTENANCE),
  optimize:     () => all(OPTIMIZE),
  recovery:     () => all(RECOVERY),
  emergency:    () => all(EMERGENCY),
  reports:      () => all(REPORTS),
  citizen:      () => all(CITIZEN),
  assistant:    body => {
    const prompt = (body && body.prompt || '').trim();
    const lc = prompt.toLowerCase();
    
    let reply = `Acknowledged: "${prompt}". Placeholder assistant — connect your LLM endpoint here.`;
    if (lc.includes('sensor') || lc.includes('readings')) {
      reply = "Currently, there are 24 sensors active across 8 lakes. 5 are experiencing connectivity issues.";
    } else if (lc.includes('incident')) {
      const open = INCIDENTS.filter(i => i.status !== 'closed').length;
      reply = `There are currently ${open} open incidents requiring attention. The most severe is at Powai Lake.`;
    } else if (lc.includes('turbidity')) {
      reply = "Turbidity levels have spiked at Bellandur Lake. Predictive models suggest a spread to adjacent regions within 12 hours if unmitigated.";
    }

    return all({
      reply,
      suggestions: [
        'Show latest sensor readings',
        'Summarize open incidents',
        'Predict turbidity for next 24h'
      ]
    });
  }
};
