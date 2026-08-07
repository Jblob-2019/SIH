import React, { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

const seedInbox = [
  { t: 'Foam reported · Varthur Lake',     src: 'Citizen · 2 min ago',  extra: '+1 photo',    tone: 'warn', cls: 'var(--surface-tint)' },
  { t: 'Dead fish · Hussain Sagar',        src: 'Citizen · 14 min ago', extra: 'urgent',      tone: 'crit', cls: 'var(--error)' },
  { t: 'Strong smell · Surajkund',         src: 'Citizen · 38 min ago', extra: '+2 photos',   tone: '',     cls: 'var(--surface-tint)' },
  { t: 'Discoloration · Loktak',           src: 'Citizen · 52 min ago', extra: 'reviewing',   tone: 'warn', cls: '' },
  { t: 'Garbage dumping · Bellandur',      src: 'Citizen · 1h ago',     extra: 'dispatched',  tone: '',     cls: 'var(--secondary)' },
  { t: 'Sewage leak · Vembanad',           src: 'Citizen · 1h 14m ago', extra: '+1 video',    tone: '',     cls: 'var(--surface-tint)' },
  { t: 'Algae visible · Nakki',            src: 'Citizen · 1h 38m ago', extra: 'correlated',  tone: 'warn', cls: '' },
  { t: 'Foul odor · Chilika',              src: 'Citizen · 2h 04m ago', extra: 'duplicate',   tone: '',     cls: '' },
  { t: 'Industrial discharge · Bhojtal',   src: 'Citizen · 2h 22m ago', extra: '+3 photos',   tone: '',     cls: 'var(--surface-tint)' }
];

const channels = [
  { nm: 'Mobile app',   pct: 64, v: 139 },
  { nm: 'WhatsApp bot', pct: 22, v: 48 },
  { nm: 'Web portal',   pct: 10, v: 22 },
  { nm: 'IVR helpline', pct: 4,  v: 9 }
];

export default function Citizen() {
  const c = useApi(api.citizen);
  const live = (c.data && c.data.tickets) || [];

  const [category, setCategory] = useState('Water pollution');
  const [gps, setGps] = useState('Detecting GPS…');
  const [desc, setDesc] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(true);
  const [fileName, setFileName] = useState('');
  const [fileSize, setFileSize] = useState('');
  const [decision, setDecision] = useState('Awaiting submission…');
  const [stage1, setStage1] = useState(false);
  const [stage2, setStage2] = useState(false);
  const [stage3, setStage3] = useState(false);
  const [stage4, setStage4] = useState(false);

  // build inbox from live API data if available, fall back to seeded list
  const inbox = useMemo(() => {
    if (live.length > 0) {
      return live.map((t, i) => ({
        t: t.topic || t.title,
        src: t.name ? `${t.name} · live` : `Citizen · ${i + 1}m ago`,
        extra: t.status || 'pending',
        tone: i === 0 ? 'warn' : i === 1 ? 'crit' : '',
        cls: t.status === 'closed' ? 'var(--secondary)' : 'var(--surface-tint)'
      }));
    }
    return seedInbox;
  }, [live]);

  function detectGps() {
    setGps('12.9716° N, 77.5946° E');
  }

  function pickFile(e) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setFileName(f.name);
    setFileSize((f.size / (1024 * 1024)).toFixed(1) + ' MB · ready');
  }

  function submit() {
    if (!desc) { setDecision('Add a description first.'); return; }
    setStage1(true); setStage2(true); setStage3(true); setStage4(true);
    setDecision(`${category} · Bellandur · ward 78 · AI 94% — routed to Alpha-3`);
  }

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Citizen Reports</h1><div className="sub">42 new · 128 resolved · 18 under review · mobile + WhatsApp + portal</div></div>
        <div className="actions"><button className="btn">Triage</button><button className="btn pri">Broadcast alert</button></div>
      </div>

      {/* Submission form */}
      <div className="card glass submit-card">
        <div className="card-h">
          <h3>Submit a report</h3>
          <div className="right">Photo · Video · GPS · Text · AI validated</div>
        </div>
        <div className="submit-grid">
          <div className="submit-col submit-media">
            <label className="dropzone" htmlFor="citizenFile">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="14" rx="1" />
                <circle cx="12" cy="12" r="3.2" />
                <path d="M3 17l5-5 4 4 4-4 5 5" />
              </svg>
              <div className="dz-title">Drop photo or video</div>
              <div className="dz-sub">JPG · PNG · MP4 · up to 25 MB · auto-blurred faces &amp; plates</div>
              <span className="btn small">Choose file</span>
              <input id="citizenFile" type="file" accept="image/*,video/*" hidden onChange={pickFile} />
            </label>
            {fileName && (
              <div className="submit-attach">
                <span className="sa-thumb" />
                <span className="sa-meta"><span>{fileName}</span><span className="sa-size">{fileSize}</span></span>
                <button className="iconbtn" onClick={() => { setFileName(''); setFileSize(''); }} aria-label="Remove attachment">×</button>
              </div>
            )}
          </div>
          <div className="submit-col submit-form">
            <label className="form-row">
              <span className="form-l">Category</span>
              <select value={category} onChange={e => setCategory(e.target.value)} aria-label="Category">
                <option>Water pollution</option>
                <option>Foam / scum</option>
                <option>Dead fish / wildlife</option>
                <option>Algal bloom</option>
                <option>Illegal discharge</option>
                <option>Garbage dumping</option>
                <option>Encroachment</option>
                <option>Other observation</option>
              </select>
            </label>
            <label className="form-row">
              <span className="form-l">Location</span>
              <span className="form-gps">
                <span className="gps-pip" />
                <span>{gps}</span>
                <button className="iconbtn small" onClick={detectGps} aria-label="Re-detect location">↻</button>
              </span>
            </label>
            <label className="form-row">
              <span className="form-l">Description</span>
              <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)} placeholder="What did you observe? When? Any smell, color, or wildlife affected?" />
            </label>
            <label className="form-row">
              <span className="form-l">Contact (optional)</span>
              <input value={contact} onChange={e => setContact(e.target.value)} placeholder="Phone or email for follow-up" />
            </label>
            <div className="submit-actions">
              <span className="consent-row">
                <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)} />
                <label>I consent to share this with the State Pollution Control Board</label>
              </span>
              <button className="btn pri" onClick={submit}>Submit report</button>
            </div>
          </div>
          <div className="submit-col submit-ai">
            <div className={'ai-stage' + (stage1 ? ' active' : '')}>
              <div className="ai-stage-num">1</div>
              <div className="ai-stage-t">Image &amp; text classified</div>
              <div className="ai-stage-s">Computer vision model v3.1 · 94% accuracy</div>
            </div>
            <div className={'ai-stage' + (stage2 ? ' active' : '')}>
              <div className="ai-stage-num">2</div>
              <div className="ai-stage-t">Geotag reverse-resolved</div>
              <div className="ai-stage-s">→ Bellandur · ward 78</div>
            </div>
            <div className={'ai-stage' + (stage3 ? ' active' : '')}>
              <div className="ai-stage-num">3</div>
              <div className="ai-stage-t">Sensor correlation</div>
              <div className="ai-stage-s">Matches WQI 28.4 · foam sensor spike · 14:31</div>
            </div>
            <div className={'ai-stage' + (stage4 ? ' active' : '')}>
              <div className="ai-stage-num">4</div>
              <div className="ai-stage-t">Duplicate check</div>
              <div className="ai-stage-s">3 nearby reports in last 90 min</div>
            </div>
            <div className={'ai-stage active'}>
              <div className="ai-stage-num">5</div>
              <div className="ai-stage-t">Decision</div>
              <div className="ai-stage-s">{decision}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card glass">
          <div className="card-h"><h3>Inbox</h3><div className="right">42 new</div></div>
          {inbox.map((m, i) => (
            <div className={'alert-item ' + m.tone} key={i}>
              <div className="t">{m.t}</div>
              <div className="m"><span>{m.src}</span><span style={{ color: m.cls }}>{m.extra}</span></div>
            </div>
          ))}
        </div>
        <div>
          <div className="card glass" style={{ marginBottom: 10 }}>
            <div className="card-h"><h3>Channels · 24h</h3><div className="right">218 reports</div></div>
            {channels.map(ch => (
              <div className="bar-row" key={ch.nm}>
                <span className="nm">{ch.nm}</span>
                <span className="track"><span className="fill" style={{ width: `${ch.pct}%` }} /></span>
                <span className="v">{ch.v}</span>
              </div>
            ))}
          </div>
          <div className="card glass" style={{ marginBottom: 10 }}>
            <div className="card-h"><h3>Recent submissions · geo</h3><div className="right">last 6h</div></div>
            <svg viewBox="0 0 360 200" width="100%" height="170" aria-label="Citizen reports map of India" preserveAspectRatio="xMidYMid meet">
              {/* faint India outline */}
              <path d="M40,160 C70,140 80,110 110,90 C140,70 150,40 200,30 C240,20 280,40 310,60 C320,80 330,110 320,150 C300,180 260,170 220,160 C180,150 140,170 100,170 C70,170 50,170 40,160 Z"
                fill="rgba(137,206,255,0.04)" stroke="rgba(137,206,255,0.15)" strokeWidth="1" />
              {/* dots: verified (red), pending (orange), duplicate (gray) */}
              <circle cx="120" cy="130" r="6" fill="var(--error)" opacity="0.7" />
              <circle cx="160" cy="100" r="5" fill="var(--tertiary-container)" opacity="0.7" />
              <circle cx="220" cy="80" r="6" fill="var(--error)" opacity="0.7" />
              <circle cx="270" cy="110" r="5" fill="var(--tertiary-container)" opacity="0.7" />
              <circle cx="100" cy="160" r="4" fill="var(--on-surface-variant)" opacity="0.5" />
              <circle cx="200" cy="140" r="5" fill="var(--tertiary-container)" opacity="0.7" />
              <circle cx="250" cy="150" r="4" fill="var(--on-surface-variant)" opacity="0.5" />
              <circle cx="180" cy="60" r="4" fill="var(--tertiary-container)" opacity="0.7" />
              <circle cx="60" cy="80" r="4" fill="var(--error)" opacity="0.7" />
            </svg>
            <div className="cm-legend">
              <span className="lg-item"><span className="lg-sw" style={{ background: 'var(--error)', opacity: 0.7 }} />Verified incident</span>
              <span className="lg-item"><span className="lg-sw" style={{ background: 'var(--tertiary-container)', opacity: 0.7 }} />Pending review</span>
              <span className="lg-item"><span className="lg-sw" style={{ background: 'var(--on-surface-variant)', opacity: 0.5 }} />Duplicate</span>
            </div>
          </div>
          <div className="card glass">
            <div className="card-h"><h3>SLA Performance</h3><div className="right">last 30d</div></div>
            <div className="stat-line"><span className="lbl">Median first response</span><span className="v">4m 12s</span></div>
            <div className="stat-line"><span className="lbl">Within 15 min target</span><span className="v" style={{ color: 'var(--secondary)' }}>92%</span></div>
            <div className="stat-line"><span className="lbl">Citizen satisfaction</span><span className="v">4.6 / 5</span></div>
            <div className="stat-line"><span className="lbl">Reports correlated to AI</span><span className="v">38%</span></div>
            <div className="stat-line"><span className="lbl">False positives</span><span className="v">6%</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
