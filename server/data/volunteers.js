/**
 * Volunteer requests store.
 * File-backed (server/data/volunteers.json) so requests survive restarts and
 * work even when Supabase is unreachable. Writes are async and serialised so
 * concurrent requests can't interleave or corrupt the file.
 */
const fs = require('fs');
const path = require('path');
const { randomBytes } = require('crypto');

const FILE = path.join(__dirname, 'volunteers.json');

const AREAS = ['Lake cleanup drives', 'Water sampling & testing', 'Awareness & outreach', 'Reporting & monitoring', 'Tree planting & bund care', 'Emergency response'];
const STATUSES = ['pending', 'accepted', 'rejected'];
const LIMITS = { name: 80, contact: 120, notes: 500, lake: 120, availability: 80 };

let items = [];
try {
  if (fs.existsSync(FILE)) items = JSON.parse(fs.readFileSync(FILE, 'utf-8'));
} catch (e) {
  console.error('[volunteers] failed to load volunteers.json, starting empty:', e.message);
}

// serialise writes: each save waits for the previous one
let writing = Promise.resolve();
const persist = () => {
  const snapshot = JSON.stringify(items, null, 2);
  writing = writing
    .then(() => fs.promises.writeFile(FILE, snapshot, 'utf-8'))
    .catch(e => console.error('[volunteers] failed to save:', e.message));
  return writing;
};

const bad = message => ({ status: 400, message });
const clean = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

module.exports = {
  AREAS,

  list: async ({ ids, status } = {}) => {
    let out = items;
    if (ids) out = out.filter(v => ids.includes(v.id));
    if (status) out = out.filter(v => v.status === status);
    return [...out].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  create: async body => {
    const b = body || {};
    const name = clean(b.name, LIMITS.name);
    const contact = clean(b.contact, LIMITS.contact);
    if (!name) throw bad('Name is required');
    if (!contact) throw bad('Phone or email is required');
    const areas = (Array.isArray(b.areas) ? b.areas : []).filter(a => AREAS.includes(a));
    if (areas.length === 0) throw bad('Choose at least one area you can help with');

    const v = {
      id: 'VOL-' + randomBytes(3).toString('hex').toUpperCase(),
      name,
      contact,
      lake: clean(b.lake, LIMITS.lake),
      areas,
      availability: clean(b.availability, LIMITS.availability),
      notes: clean(b.notes, LIMITS.notes),
      status: 'pending',
      createdAt: new Date().toISOString(),
      decidedAt: null
    };
    items.unshift(v);
    await persist();
    return v;
  },

  // only the decision can change; everything else is fixed at submission
  decide: async (id, body) => {
    const status = body && body.status;
    if (!STATUSES.includes(status)) throw bad(`status must be one of: ${STATUSES.join(', ')}`);
    const v = items.find(x => x.id === id);
    if (!v) throw { status: 404, message: 'Volunteer request not found' };
    v.status = status;
    v.decidedAt = status === 'pending' ? null : new Date().toISOString();
    await persist();
    return v;
  }
};
