/**
 * AI resource-optimization recommendations.
 * The recommendation set is fixed (no model backs it yet); what is persisted is
 * the operators' decision on each one (applied / pending), in
 * server/data/optimize-state.json. Writes are async and serialised.
 *
 * Each item also carries action / target / priority so the AI Assistant page,
 * which reads the same endpoint, keeps working.
 */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'optimize-state.json');

const RECOMMENDATIONS = [
  { id: 'OPT-1', prio: '↑ 8%',  tier: 'high', text: 'Add Tech-2 to Bellandur shift rotation',     meta: 'Cost +₹ 0.4L/mo · Risk ↓ 22% · ETA 2d',        target: 'Bellandur',   priority: 'High' },
  { id: 'OPT-2', prio: '↑ 12%', tier: 'high', text: 'Pre-position aerator barge at Hyderabad HQ', meta: 'Cost +₹ 1.2L/mo · Response ↓ 38% · ETA 5d',    target: 'Hyderabad HQ', priority: 'High' },
  { id: 'OPT-3', prio: '↓ 14%', tier: 'mid',  text: 'Defer Chilika sensor replacement to Sep 12', meta: 'Save ₹ 2.8L · Low risk · ETA 0d',              target: 'Chilika',     priority: 'Medium' },
  { id: 'OPT-4', prio: '↑ 6%',  tier: 'mid',  text: 'Move Alpha-3 from Vembanad to Loktak',       meta: 'Risk ↓ 8% · No cost · ETA 1d',                 target: 'Loktak',      priority: 'Medium' },
  { id: 'OPT-5', prio: '↓ 4%',  tier: 'low',  text: 'Re-rate 7 sensors as scheduled-retire',      meta: 'Save ₹ 0.9L · Hardware end-of-life',           target: 'Sensor fleet', priority: 'Low' }
];

// { [id]: { appliedAt } }
let state = {};
try {
  if (fs.existsSync(FILE)) state = JSON.parse(fs.readFileSync(FILE, 'utf-8')) || {};
} catch (e) {
  console.error('[optimize] failed to load optimize-state.json, starting empty:', e.message);
}

let writing = Promise.resolve();
const persist = () => {
  const snapshot = JSON.stringify(state, null, 2);
  writing = writing
    .then(() => fs.promises.writeFile(FILE, snapshot, 'utf-8'))
    .catch(e => console.error('[optimize] failed to save:', e.message));
  return writing;
};

const view = r => {
  const s = state[r.id];
  return { ...r, action: r.text, status: s ? 'applied' : 'pending', appliedAt: s ? s.appliedAt : null };
};

const find = id => {
  const r = RECOMMENDATIONS.find(x => x.id === id);
  if (!r) throw { status: 404, message: 'Recommendation not found' };
  return r;
};

module.exports = {
  list: async () => RECOMMENDATIONS.map(view),

  apply: async id => {
    const r = find(id);
    if (!state[r.id]) state[r.id] = { appliedAt: new Date().toISOString() };
    await persist();
    return view(r);
  },

  revert: async id => {
    const r = find(id);
    delete state[r.id];
    await persist();
    return view(r);
  },

  // apply every recommendation that is still pending; returns how many changed
  applyAll: async () => {
    const now = new Date().toISOString();
    let changed = 0;
    RECOMMENDATIONS.forEach(r => { if (!state[r.id]) { state[r.id] = { appliedAt: now }; changed++; } });
    if (changed) await persist();
    return { applied: changed, recommendations: RECOMMENDATIONS.map(view) };
  }
};
