import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

const STORE_KEY = 'aquamind.volunteerIds';
const AVAILABILITY = ['Weekdays', 'Weekends', 'Evenings', 'Anytime', 'Emergencies only'];

const loadIds = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || []; } catch { return []; } };
const saveIds = ids => { try { localStorage.setItem(STORE_KEY, JSON.stringify(ids)); } catch { /* ignore */ } };

const statusPill = s => (s === 'accepted' ? 'pill ok' : s === 'rejected' ? 'pill crit' : 'pill warn');
const statusText = s => (s === 'accepted' ? 'Accepted' : s === 'rejected' ? 'Not accepted' : 'Pending review');

const field = { padding: 8, borderRadius: 'var(--r)', background: 'var(--surface-container)', color: 'var(--on-surface)', border: '1px solid var(--outline)', width: '100%', boxSizing: 'border-box' };
const row = { display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 };

/* Volunteer — public sign-up. Requests go to the authorities, who accept or
   reject them from Citizen Reports. Submitted request IDs are remembered in
   this browser so the volunteer can follow the status of their own requests. */
export default function Volunteer() {
  const lakes = useApi(api.lakes);
  const lakeNames = useMemo(() => ((lakes.data && lakes.data.lakes) || []).map(l => l.name), [lakes.data]);

  const [areaOptions, setAreaOptions] = useState([]);
  const [ids, setIds] = useState(loadIds);
  const [mine, setMine] = useState([]);
  const [loadingMine, setLoadingMine] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [lake, setLake] = useState('');
  const [areas, setAreas] = useState([]);
  const [availability, setAvailability] = useState(AVAILABILITY[0]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const refreshMine = () => {
    if (ids.length === 0) { setMine([]); return Promise.resolve(); }
    setLoadingMine(true);
    return api.volunteers(ids)
      .then(d => setMine(d.volunteers || []))
      .catch(() => {})
      .finally(() => setLoadingMine(false));
  };

  // area options come from the server so the form and API validation never drift apart
  useEffect(() => {
    api.volunteers(['-']).then(d => d.areas && setAreaOptions(d.areas)).catch(() => {});
  }, []);

  // follow the status of my requests; poll so an acceptance shows up without a reload
  useEffect(() => {
    refreshMine();
    const t = setInterval(refreshMine, 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ids]);

  const toggleArea = a => setAreas(cur => (cur.includes(a) ? cur.filter(x => x !== a) : [...cur, a]));

  async function submit(e) {
    e.preventDefault();
    setError(''); setDone('');
    if (!name.trim()) return setError('Please enter your name.');
    if (!contact.trim()) return setError('Please enter a phone number or email so we can reach you.');
    if (areas.length === 0) return setError('Choose at least one area you can help with.');
    setSaving(true);
    try {
      const v = await api.createVolunteer({ name, contact, lake, areas, availability, notes });
      const next = [v.id, ...ids];
      saveIds(next);
      setIds(next);
      setDone(`Thank you, ${v.name}! Your request ${v.id} has been sent to the authorities.`);
      setName(''); setContact(''); setLake(''); setAreas([]); setNotes('');
    } catch (err) {
      setError(err.message || 'Could not submit your request. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <h1>Volunteer</h1>
          <div className="sub">Join the community effort to protect Tamil Nadu lakes · authorities review every request</div>
        </div>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1.2fr 1fr' }}>
        <form className="card glass" onSubmit={submit} style={{ padding: 18 }}>
          <div className="card-h"><h3>Sign up to volunteer</h3><div className="right">takes under a minute</div></div>

          <label style={row}>
            <span className="form-l">Your name *</span>
            <input style={field} value={name} maxLength={80} onChange={e => setName(e.target.value)} placeholder="e.g. Meena Raman" />
          </label>
          <label style={row}>
            <span className="form-l">Phone or email *</span>
            <input style={field} value={contact} maxLength={120} onChange={e => setContact(e.target.value)} placeholder="So the authorities can contact you" />
          </label>
          <label style={row}>
            <span className="form-l">Lake you want to help (optional)</span>
            <select style={field} value={lake} onChange={e => setLake(e.target.value)}>
              <option value="">Any lake / wherever needed</option>
              {lakeNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>

          <div style={row}>
            <span className="form-l">How can you help? *</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {areaOptions.map(a => (
                <label key={a} className={'tag' + (areas.includes(a) ? ' active' : '')} style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={areas.includes(a)} onChange={() => toggleArea(a)} style={{ accentColor: 'var(--primary)' }} />
                  {a}
                </label>
              ))}
            </div>
          </div>

          <label style={row}>
            <span className="form-l">When are you available?</span>
            <select style={field} value={availability} onChange={e => setAvailability(e.target.value)}>
              {AVAILABILITY.map(a => <option key={a}>{a}</option>)}
            </select>
          </label>
          <label style={row}>
            <span className="form-l">Anything else we should know? (optional)</span>
            <textarea style={{ ...field, minHeight: 70, resize: 'vertical' }} value={notes} maxLength={500} onChange={e => setNotes(e.target.value)} placeholder="Skills, equipment, group size…" />
          </label>

          {error && <div style={{ marginBottom: 12, color: 'var(--error)', fontSize: 13 }}>{error}</div>}
          {done && <div style={{ marginBottom: 12, color: 'var(--secondary)', fontSize: 13 }}>{done}</div>}
          <button type="submit" className="btn pri" disabled={saving} style={{ justifyContent: 'center', width: '100%' }}>
            {saving ? 'Submitting…' : 'Submit volunteer request'}
          </button>
        </form>

        <div className="card glass" style={{ alignSelf: 'start' }}>
          <div className="card-h"><h3>Your requests</h3><div className="right">{mine.length}</div></div>
          {mine.length === 0 && (
            <div style={{ padding: 14, color: 'var(--on-surface-variant)', fontSize: 13 }}>
              {loadingMine ? 'Loading…' : 'Requests you submit from this browser will appear here with their status.'}
            </div>
          )}
          {mine.map(v => (
            <div className="alert-item" key={v.id}>
              <div className="t">{v.id} · {v.areas.join(', ')}</div>
              <div className="m">
                <span>{v.lake || 'Any lake'} · {v.availability || 'flexible'}</span>
                <span className={statusPill(v.status)}><span className="pip" />{statusText(v.status)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
