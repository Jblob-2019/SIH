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

    return data.map(d => ({
      id: d.water_body_id,
      name: d.name,
      city: d.district_name || 'Unknown',
      state: 'TN', // Seed data is TN
      area_km2: 0, // Not in view by default, but UI doesn't crash without it
      status: mapStatus(healthMap[d.water_body_id]),
      lat: 13.0, // UI maps typically need this, but we can default it 
      lon: 80.0
    }));
  },
  
  lake: async (id) => {
    return { lake: { id }, sensors: [] }; // Stub for individual lake view
  },

  // sensors
  sensors: async () => {
    const data = extract(await supabase.from('vw_latest_water_quality').select('*'));
    return data.map(d => ({
      id: `SN-${d.water_body_id}`,
      lakeId: d.water_body_id,
      lakeName: d.name,
      type: 'Multi-parameter',
      battery: 100,
      signal: 'good',
      status: d.do_status === 'Critical' ? 'crit' : 'ok',
      lastReading: d.recorded_at,
      lat: 13.0,
      lon: 80.0
    }));
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
  assistant: async () => ({ reply: 'Supabase DB connected.', suggestions: [] })
};
