const { supabase, configured } = require('./db');
const { coordsFor } = require('../data/geo');
const offline = require('../data/store');

const nowISO = () => new Date().toISOString();
const OLLAMA = process.env.OLLAMA_URL || 'http://localhost:11434';

// Helper to gracefully handle supabase responses
const extract = (res) => {
  if (res.error) {
    console.error('Supabase query error:', res.error.message || res.error);
    throw res.error;
  }
  return res.data;
};

const mapStatus = (statusStr) => {
  if (!statusStr) return 'ok';
  const s = statusStr.toLowerCase();
  if (s === 'good' || s === 'safe') return 'ok';
  if (s === 'warning' || s === 'poor') return 'warn';
  if (s === 'critical') return 'crit';
  return 'ok';
};

// damage_control.severity <-> UI severity
const toUiSeverity = sev => {
  const s = (sev || '').toLowerCase();
  if (s === 'high' || s === 'critical') return 'crit';
  if (s === 'low') return 'info';
  return 'warn';
};
const toDbSeverity = sev => sev === 'crit' ? 'High' : sev === 'info' ? 'Low' : 'Medium';

const actionId = id => {
  const n = Number(String(id).replace(/^ACT-/i, ''));
  if (!Number.isInteger(n)) throw { status: 400, message: `Invalid incident id: ${id}` };
  return n;
};

const toIncident = d => ({
  id: `ACT-${d.action_id}`,
  lake: d.water_bodies?.name || d.name || 'Unknown',
  severity: toUiSeverity(d.severity),
  title: d.issue_detected,
  status: d.status,
  team: d.team || undefined,
  openedAt: d.detected_at || nowISO()
});

const INCIDENT_COLS = 'action_id, issue_detected, severity, status, detected_at, water_bodies(name)';

// ---------- live (Supabase) implementations ----------
const live = {
  // metrics
  metrics: async () => {
    // 1. Total Lakes
    const lakesRes = await supabase.from('water_bodies').select('*', { count: 'exact', head: true });
    extract(lakesRes);

    // 2. Open incidents (Damage control not resolved)
    const openRes = await supabase.from('damage_control').select('*', { count: 'exact', head: true }).neq('status', 'Resolved');
    extract(openRes);

    // 3. Health scores
    const health = extract(await supabase.from('health_score').select('overall_score, status'));

    let ecoIndex = 75.0;
    let compliancePct = 90.0;

    if (health.length > 0) {
      ecoIndex = health.reduce((sum, h) => sum + (h.overall_score || 0), 0) / health.length;
      const goodCount = health.filter(h => h.status === 'Good').length;
      compliancePct = (goodCount / health.length) * 100;
    }

    const total = lakesRes.count || 0;
    return {
      totalLakes: total,
      sensorsOnline: total * 3 - 2, // Mocking sensors based on lakes
      sensorsTotal: total * 3,
      openIncidents: openRes.count || 0,
      ecoIndex,
      compliancePct,
      alertsToday: openRes.count || 0,
      ts: nowISO()
    };
  },

  // lakes
  lakes: async () => {
    const data = extract(await supabase.from('vw_latest_water_quality').select('*'));

    // Also fetch health status to map to crit/warn/ok
    const health = extract(await supabase.from('health_score').select('water_body_id, status'));
    const healthMap = {};
    health.forEach(h => healthMap[h.water_body_id] = h.status);

    return data.map(d => {
      const { lat, lon, area } = coordsFor(d.name, d.water_body_id);

      // Use turbidity for continuous color gradient. If null, derive a pseudo-random value from ID. 0 (good) to 50 (bad)
      const metricValue = d.turbidity != null ? d.turbidity : (d.water_body_id * 7 % 50);

      return {
        id: d.water_body_id,
        name: d.name,
        city: d.district_name || 'Unknown',
        state: 'TN', // Seed data is TN
        area_km2: area,
        status: mapStatus(healthMap[d.water_body_id]),
        metricValue,
        lat,
        lon,
        ph: d.ph,
        dissolved_oxygen: d.dissolved_oxygen,
        turbidity: d.turbidity,
        water_level_m: d.water_level_m,
        recorded_at: d.recorded_at
      };
    });
  },

  lake: async (id) => {
    const lake = (await live.lakes()).find(l => String(l.id) === String(id));
    if (!lake) throw { status: 404, message: 'Lake not found' };
    const sensors = (await live.sensors()).filter(s => s.lakeId === lake.id);
    return { lake, sensors };
  },

  // sensors
  sensors: async () => {
    const data = extract(await supabase.from('vw_latest_water_quality').select('*'));
    return data.map(d => {
      const { lat, lon } = coordsFor(d.name, d.water_body_id);
      return {
        id: `SN-${d.water_body_id}`,
        lakeId: d.water_body_id,
        lakeName: d.name,
        type: 'Multi-parameter',
        battery: 100,
        signal: 'good',
        status: d.do_status === 'Critical' ? 'crit' : 'ok',
        lastReading: d.recorded_at,
        lat,
        lon
      };
    });
  },
  sensor: async (id) => {
    const s = (await live.sensors()).find(x => x.id === id);
    if (!s) throw { status: 404, message: 'Sensor not found' };
    return s;
  },
  readings: async (id) => {
    const lakeId = id.replace('SN-', '');
    const data = extract(await supabase.from('live_water_parameters').select('*').eq('water_body_id', lakeId).order('recorded_at', { ascending: false }).limit(24));
    return {
      sensorId: id,
      type: 'Multi-parameter',
      series: data.map(d => ({ t: d.recorded_at, value: d.ph || 7.0 }))
    };
  },

  // incidents — open actions from damage_control (same rows as vw_open_actions,
  // but with the action_id primary key so incidents have stable IDs)
  incidents: async () => {
    const data = extract(await supabase.from('damage_control').select(INCIDENT_COLS).neq('status', 'Resolved').order('detected_at', { ascending: false }));
    return data.map(toIncident);
  },
  incident: async (id) => {
    const data = extract(await supabase.from('damage_control').select(INCIDENT_COLS).eq('action_id', actionId(id)).maybeSingle());
    if (!data) throw { status: 404, message: 'Incident not found' };
    return toIncident(data);
  },
  createIncident: async (body) => {
    if (!body || !body.lake || !body.title) throw { status: 400, message: 'lake and title are required' };
    const wb = extract(await supabase.from('water_bodies').select('water_body_id').eq('name', body.lake).maybeSingle());
    if (!wb) throw { status: 400, message: `Unknown lake: ${body.lake}` };
    const row = extract(await supabase.from('damage_control').insert({
      water_body_id: wb.water_body_id,
      issue_detected: body.title,
      severity: toDbSeverity(body.severity),
      status: 'Open',
      detected_at: nowISO()
    }).select(INCIDENT_COLS).single());
    return toIncident(row);
  },
  patchIncident: async (id, body) => {
    const patch = {};
    if (body && body.status)   patch.status = body.status;
    if (body && body.severity) patch.severity = toDbSeverity(body.severity);
    if (body && body.title)    patch.issue_detected = body.title;
    if (!Object.keys(patch).length) throw { status: 400, message: 'Nothing to update (status, severity or title)' };
    const row = extract(await supabase.from('damage_control').update(patch).eq('action_id', actionId(id)).select(INCIDENT_COLS).maybeSingle());
    if (!row) throw { status: 404, message: 'Incident not found' };
    return toIncident(row);
  },

  // forecasts
  forecasts: async () => {
    const data = extract(await supabase.from('prediction').select('*').order('predicted_for_date', { ascending: true }));
    // Just map the first available lake's predictions for the sparkline trend
    if (data.length === 0) return [];

    const lake1 = data.filter(d => d.water_body_id === data[0].water_body_id);
    return lake1.map(d => ({
      date: d.predicted_for_date,
      do_mgL: d.predicted_do || 6.5,
      ph: d.predicted_ph || 7.2,
      turbidity_ntu: 4.0, // Assuming static for now if not predicted
      level_m: d.predicted_water_level_m || 1.1
    }));
  },

  // other
  anomalies: async () => {
    const data = extract(await supabase.from('live_water_parameters').select('*, water_bodies(name)').order('recorded_at', { ascending: false }).limit(50));
    const anoms = [];
    data.forEach(d => {
      const base = { sensorId: `SN-${d.water_body_id}`, lakeName: d.water_bodies?.name || 'Unknown', detectedAt: d.recorded_at };
      if (d.ph != null && (d.ph < 6.5 || d.ph > 8.5)) anoms.push({ id: `AN-${d.reading_id}-PH`, type: 'pH', deviation: d.ph, ...base });
      if (d.dissolved_oxygen != null && d.dissolved_oxygen < 5) anoms.push({ id: `AN-${d.reading_id}-DO`, type: 'DO', deviation: d.dissolved_oxygen, ...base });
    });
    return anoms;
  },
  biodiversity: async () => {
    const data = extract(await supabase.from('marine_mortality').select('*, water_bodies(name)'));
    return data.map(d => ({
      species: d.species_affected,
      count: d.estimated_count,
      lake: d.water_bodies?.name || 'Unknown',
      trend: `at ${d.water_bodies?.name || 'Unknown'}`
    }));
  },
  maintenance: async () => [],
  optimize: async () => [],
  recovery: async () => {
    const data = extract(await supabase.from('vw_revival_progress').select('*'));
    return data.map((d, i) => ({
      id: `REV-${d.revival_id ?? i + 1}`,
      lake: d.name,
      stage: d.scheme_name,
      pct: d.progress_percent
    }));
  },
  emergency: async () => {
    const data = extract(await supabase.from('damage_control').select('*, water_bodies(name)').eq('severity', 'High').neq('status', 'Resolved'));
    return data.map(d => ({
      id: `EM-${d.action_id}`,
      severity: 'crit',
      title: `${d.water_bodies?.name || 'Unknown'} - ${d.issue_detected}`,
      ts: d.detected_at
    }));
  },
  reports: async () => [],
  citizen: async () => []
};

// ---------- offline fallback ----------
// When Supabase can't be reached (DNS failure, project paused, no network,
// missing credentials) every data call falls back to the synthetic TN store in
// data/store.js. The outage is remembered for RETRY_MS so each request doesn't
// pay the connection timeout again. Real DB errors (RLS, bad column…) still
// propagate so they aren't masked.
const RETRY_MS = 60000;
let offlineUntil = configured ? 0 : Infinity;

const isNetworkError = e => /fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|EAI_AGAIN|aborted|timeout/i
  .test(`${e && e.message} ${e && e.details}`);

const withFallback = name => async (...args) => {
  if (Date.now() < offlineUntil) return offline[name](...args);
  try {
    return await live[name](...args);
  } catch (e) {
    if (!isNetworkError(e)) throw e;
    console.warn(`[store] Supabase unreachable (${name}) — serving offline data for ${RETRY_MS / 1000}s`);
    offlineUntil = Date.now() + RETRY_MS;
    return offline[name](...args);
  }
};

const store = {};
Object.keys(live).forEach(name => { store[name] = withFallback(name); });

store.dataSource = () => (Date.now() < offlineUntil ? 'offline' : 'supabase');

// ---------- assistant (Ollama) ----------
store.getOllamaModels = async () => {
  try {
    const res = await fetch(`${OLLAMA}/api/tags`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.models.map(m => m.name);
  } catch (e) {
    console.error('Failed to fetch Ollama models:', e.message);
    return [];
  }
};

store.assistant = async ({ prompt, model }) => {
  if (!prompt) return { reply: 'Please provide a prompt.' };
  // default to the first installed model rather than assuming llama3 is pulled
  const selectedModel = model || (await store.getOllamaModels())[0] || 'llama3';

  // 1. Gather context from the DB (or offline store)
  let contextStr = '';
  try {
    const [mets, lks, incs] = await Promise.all([store.metrics(), store.lakes(), store.incidents()]);

    contextStr = `Current System Status:
- Total Lakes: ${mets.totalLakes}
- Open Incidents: ${mets.openIncidents}
- Eco Index: ${mets.ecoIndex.toFixed(1)}%

Lakes summary:
${lks.map(l => `- ${l.name} (${l.city}): Status ${l.status}, pH ${l.ph ?? 'n/a'}, DO ${l.dissolved_oxygen ?? 'n/a'} mg/L, turbidity ${l.turbidity ?? 'n/a'} NTU`).join('\n')}

Recent Incidents:
${incs.map(i => `- [${i.severity.toUpperCase()}] ${i.lake}: ${i.title}`).join('\n')}
`;
  } catch (e) {
    contextStr = 'Failed to retrieve live DB context.';
  }

  const systemPrompt = `You are the AquaMind HIC (Hydraulic Intelligence Command) AI Assistant.
You help operators manage water bodies, predict incidents, and analyze data.
Use the following live context from the database to answer the user's queries accurately:

${contextStr}

Respond concisely and professionally in plain text or simple markdown.`;

  try {
    const res = await fetch(`${OLLAMA}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: selectedModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        stream: false
      })
    });

    if (!res.ok) {
      if (res.status === 404) return { reply: `Model "${selectedModel}" is not installed in Ollama. Run \`ollama pull ${selectedModel}\` or pick another model.` };
      return { reply: `Ollama error: HTTP ${res.status}` };
    }

    const data = await res.json();
    return { reply: data.message?.content || 'No response from AI.', model: selectedModel };
  } catch (e) {
    console.error('Ollama API error:', e.message);
    return { reply: 'Failed to connect to local Ollama instance. Is it running on port 11434?' };
  }
};

module.exports = store;
