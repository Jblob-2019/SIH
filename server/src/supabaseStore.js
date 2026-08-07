const { supabase } = require('./db');

const nowISO = () => new Date().toISOString();

// Helper to gracefully handle supabase responses
const extract = (res) => {
  if (res.error) {
    console.error('Supabase query error:', res.error);
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

const geoCache = {
  "Chembarambakkam Lake": { "lat": 13.0081524, "lon": 80.055375, "area": 15.32 },
  "Puzhal (Red Hills) Lake": { "lat": 13.1594, "lon": 80.1747, "area": 18.0 },
  "Poondi Reservoir": { "lat": 13.2372, "lon": 79.8456, "area": 32.0 },
  "Pulicat Lake": { "lat": 13.640242, "lon": 80.1671589, "area": 450.0 },
  "Ooty Lake": { "lat": 11.4034171, "lon": 76.6916789, "area": 0.65 },
  "Kodaikanal Lake": { "lat": 10.234003, "lon": 77.4865229, "area": 0.24 },
  "Yercaud Lake": { "lat": 11.7832744, "lon": 78.2104687, "area": 0.11 },
  "Singanallur Lake": { "lat": 10.9911946, "lon": 77.0233434, "area": 1.15 },
  "Valankulam Lake": { "lat": 10.9922, "lon": 76.9744, "area": 0.65 },
  "Bhavanisagar Reservoir (Lower Bhavani)": { "lat": 11.4705, "lon": 77.1264, "area": 87.0 },
  "Mettur Dam Reservoir": { "lat": 11.8016, "lon": 77.8019, "area": 155.0 },
  "Vaigai Dam Reservoir": { "lat": 10.0538, "lon": 77.5894, "area": 24.0 },
  "Kaliveli Lake (Kazhuveli Wetland)": { "lat": 12.0620, "lon": 79.8252, "area": 74.0 },
  "Vembannur Wetland Complex": { "lat": 8.1691, "lon": 77.3887, "area": 0.20 },
  "Cauvery River (TN Stretch)": { "lat": 11.3503, "lon": 77.8344, "area": 50.0 },
  "Vaigai River": { "lat": 9.8808298, "lon": 78.1864627, "area": 25.0 },
  "Tamiraparani River": { "lat": 8.7183539, "lon": 77.5359567, "area": 15.0 },
  "Noyyal River": { "lat": 11.1078792, "lon": 77.2994439, "area": 10.0 }
};

module.exports = {
  // metrics
  metrics: async () => {
    // 1. Total Lakes
    const { count: totalLakes } = await supabase.from('water_bodies').select('*', { count: 'exact', head: true });
    
    // 2. Open incidents (Damage control not resolved)
    const { count: openIncidents } = await supabase.from('damage_control').select('*', { count: 'exact', head: true }).neq('status', 'Resolved');

    // 3. Health scores
    const health = extract(await supabase.from('health_score').select('overall_score, status'));
    
    let ecoIndex = 75.0;
    let compliancePct = 90.0;
    
    if (health.length > 0) {
      ecoIndex = health.reduce((sum, h) => sum + (h.overall_score || 0), 0) / health.length;
      const goodCount = health.filter(h => h.status === 'Good').length;
      compliancePct = (goodCount / health.length) * 100;
    }

    return {
      totalLakes: totalLakes || 0,
      sensorsOnline: (totalLakes || 0) * 3 - 2, // Mocking sensors based on lakes
      sensorsTotal: (totalLakes || 0) * 3,
      openIncidents: openIncidents || 0,
      ecoIndex,
      compliancePct,
      alertsToday: openIncidents || 0,
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
      let coords = geoCache[d.name] || { lat: 11.1271, lon: 78.6569 };
      let lat = coords.lat;
      let lon = coords.lon;

      // Prevent perfect stacking of pins for lakes that fall back to the generic TN coordinate
      if (lat === 11.1271 && lon === 78.6569) {
        lat += (d.water_body_id * 0.08) - 0.5;
        lon += ((d.water_body_id % 7) * 0.08) - 0.25;
      }

      // Use turbidity for continuous color gradient. If null, derive a pseudo-random value from ID. 0 (good) to 50 (bad)
      let metricValue = d.turbidity !== null ? d.turbidity : (d.water_body_id * 7 % 50);

      return {
        id: d.water_body_id,
        name: d.name,
        city: d.district_name || 'Unknown',
        state: 'TN', // Seed data is TN
        area_km2: coords.area || 10.0,
        status: mapStatus(healthMap[d.water_body_id]),
        metricValue: metricValue,
        lat: lat,
        lon: lon,
        ph: d.ph,
        dissolved_oxygen: d.dissolved_oxygen,
        turbidity: d.turbidity,
        water_level_m: d.water_level_m,
        recorded_at: d.recorded_at
      };
    });
  },
  
  lake: async (id) => {
    return { lake: { id }, sensors: [] }; // Stub for individual lake view
  },

  // sensors
  sensors: async () => {
    const data = extract(await supabase.from('vw_latest_water_quality').select('*'));
    return data.map(d => {
      let coords = geoCache[d.name] || { lat: 11.1271, lon: 78.6569 };
      let lat = coords.lat;
      let lon = coords.lon;

      if (lat === 11.1271 && lon === 78.6569) {
        lat += (d.water_body_id * 0.08) - 0.5;
        lon += ((d.water_body_id % 7) * 0.08) - 0.25;
      }
      
      return {
        id: `SN-${d.water_body_id}`,
        lakeId: d.water_body_id,
        lakeName: d.name,
        type: 'Multi-parameter',
        battery: 100,
        signal: 'good',
        status: d.do_status === 'Critical' ? 'crit' : 'ok',
        lastReading: d.recorded_at,
        lat: lat,
        lon: lon
      };
    });
  },
  sensor: async (id) => ({ id }),
  readings: async (id) => {
    const lakeId = id.replace('SN-', '');
    const data = extract(await supabase.from('live_water_parameters').select('*').eq('water_body_id', lakeId).order('recorded_at', { ascending: false }).limit(24));
    return {
      sensorId: id,
      type: 'Multi-parameter',
      series: data.map(d => ({ t: d.recorded_at, value: d.ph || 7.0 }))
    };
  },

  // incidents
  incidents: async () => {
    const data = extract(await supabase.from('vw_open_actions').select('*'));
    return data.map(d => ({
      id: `ACT-${Math.floor(Math.random()*1000)}`, // We need an ID for UI key
      lake: d.name,
      severity: d.severity?.toLowerCase() === 'high' ? 'crit' : 'warn',
      title: d.issue_detected,
      status: d.status,
      openedAt: d.detected_at || nowISO()
    }));
  },
  
  createIncident: async (body) => ({ id: 'new', ...body }),
  patchIncident: async (id, body) => ({ id, ...body }),

  // forecasts
  forecasts: async () => {
    const data = extract(await supabase.from('prediction').select('*').order('predicted_for_date', { ascending: true }));
    // Just map the first available lake's predictions for the sparkline trend
    if (data.length === 0) return [];
    
    // Group by date or just take the first lake
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
      if (d.ph < 6.5 || d.ph > 8.5) anoms.push({ id: `AN-${d.reading_id}-PH`, sensorId: `SN-${d.water_body_id}`, type: 'pH', deviation: d.ph, detectedAt: d.recorded_at });
      if (d.dissolved_oxygen < 5) anoms.push({ id: `AN-${d.reading_id}-DO`, sensorId: `SN-${d.water_body_id}`, type: 'DO', deviation: d.dissolved_oxygen, detectedAt: d.recorded_at });
    });
    return anoms;
  },
  biodiversity: async () => {
    const data = extract(await supabase.from('marine_mortality').select('*, water_bodies(name)'));
    return data.map(d => ({
      species: d.species_affected,
      count: d.estimated_count,
      trend: `at ${d.water_bodies?.name || 'Unknown'}`
    }));
  },
  maintenance: async () => [],
  optimize: async () => [],
  recovery: async () => {
    const data = extract(await supabase.from('vw_revival_progress').select('*'));
    return data.map(d => ({
      id: `REV-${Math.floor(Math.random()*100)}`,
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
  citizen: async () => [],
  
  getOllamaModels: async () => {
    try {
      const res = await fetch('http://localhost:11434/api/tags');
      if (!res.ok) return [];
      const data = await res.json();
      return data.models.map(m => m.name);
    } catch (e) {
      console.error('Failed to fetch Ollama models:', e);
      return [];
    }
  },

  assistant: async ({ prompt, model }) => {
    if (!prompt) return { reply: 'Please provide a prompt.' };
    const selectedModel = model || 'llama3';

    // 1. Gather context from Supabase
    let contextStr = '';
    try {
      const mets = await module.exports.metrics();
      const lks = await module.exports.lakes();
      const incs = await module.exports.incidents();
      
      contextStr = `Current System Status:
- Total Lakes: ${mets.totalLakes}
- Open Incidents: ${mets.openIncidents}
- Eco Index: ${mets.ecoIndex.toFixed(1)}%

Lakes summary:
${lks.map(l => `- ${l.name} (${l.city}): Status ${l.status}`).join('\n')}

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
      const res = await fetch('http://localhost:11434/api/chat', {
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
        return { reply: `Ollama error: HTTP ${res.status}` };
      }

      const data = await res.json();
      return { 
        reply: data.message?.content || 'No response from AI.'
      };
    } catch (e) {
      console.error('Ollama API error:', e);
      return { reply: 'Failed to connect to local Ollama instance. Is it running on port 11434?' };
    }
  }
};
