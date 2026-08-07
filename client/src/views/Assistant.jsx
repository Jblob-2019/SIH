import React, { useState } from 'react';

const seedMsgs = [
  { you: 'Give me a national posture summary.' },
  { ai: (
    <>
      <strong>National Posture · 14:32 IST</strong>
      <ul>
        <li>312 healthy (75.7%) · 84 moderate · 16 critical</li>
        <li>Bellandur, Nakki, Surajkund, Hussain Sagar, Bhojtal flagged for immediate intervention</li>
        <li>8 active incidents, 23 teams deployed</li>
        <li>AI: 41 recommendations issued today — 28 accepted, 13 pending review</li>
      </ul>
      <div className="meta"><span className="pip" />14:32:08 · 4 sources</div>
    </>
  ) },
  { you: 'Why is Bellandur critical right now?' },
  { ai: (
    <>
      Bellandur shows a rapid WQI drop (74 → 28 in 9d). Three drivers:
      <ul>
        <li><strong>Surfactant load</strong> at S-12 outflow 4.2× baseline since 11 Aug</li>
        <li><strong>DO collapse</strong> to 2.1 mg/L — anaerobic zone expanding in NE basin</li>
        <li><strong>Wind &lt; 4 km/h</strong> — foam not dispersing</li>
      </ul>
      <div className="meta"><span className="pip" />14:32:14 · 3 sensors · 1 satellite</div>
    </>
  ) },
  { you: 'Recommend the next action.' },
  { ai: (
    <>
      <strong>Priority 1 (within 30 min):</strong> Dispatch aeration boats Alpha-3 to NE basin · deploy 4 portable DO probes.<br />
      <strong>Priority 2 (within 4h):</strong> Issue Section 5 notice to S-12 discharger; sample 6 outflow points.<br />
      <strong>Priority 3 (within 24h):</strong> Schedule community advisory via BBMP if foam exceeds 2 ha.
      <div className="meta"><span className="pip" />14:32:21 · confidence 94%</div>
    </>
  ) },
  { you: 'Forecast WQI for Bellandur in 72h if no action.' },
  { ai: (
    <>
      <strong>72h projection (no intervention):</strong> WQI 18.4 ± 3.1 · high-confidence.<br />
      Probability of foam event &gt; 2 ha: <strong style={{ color: 'var(--error)' }}>88%</strong>.<br />
      Recovery to WQI &gt; 60 without action: not before 21 Aug.
      <div className="meta"><span className="pip" />14:32:30 · model 7d-forecast v2</div>
    </>
  ) }
];

const recs = [
  { tone: 'warn', t: 'Issue advisory · Bellandur',        m1: 'Section 5',      m2: 'accepted', onAcc: true },
  { tone: '',     t: 'Reconfigure sensors · Chilika',     m1: 'OR-CTL-11/12',   m2: 'pending' },
  { tone: 'crit', t: 'Aerate NE basin · Bellandur',       m1: 'in progress',    m2: 'accepted', onAcc: true },
  { tone: '',     t: 'Deploy DO probes ×4 · Bellandur',   m1: 'portable kit',   m2: 'accepted', onAcc: true },
  { tone: 'warn', t: 'Citizen alert · Vembanad',          m1: 'tidal',          m2: 'pending' },
  { tone: '',     t: 'Calibrate pH probes · Dal',         m1: 'scheduled',      m2: 'accepted', onAcc: true },
  { tone: 'warn', t: 'Inspect outflow S-12 · Bellandur',  m1: 'in 4h',          m2: 'pending' }
];

const chips = ['Why is Dal healthy?', 'Compare Chilika & Vembanad', 'Forecast national WQI 7d', 'Dispatch summary', 'Top 5 risks'];

export default function Assistant() {
  const [input, setInput] = useState('');
  const [extra, setExtra] = useState([]);

  function send(text) {
    const t = (text || input).trim();
    if (!t) return;
    setExtra(e => [...e, { you: t }, { ai: (<><strong>Acknowledged.</strong> Logged prompt to AquaMind.<div className="meta"><span className="pip" />just now</div></>) }]);
    setInput('');
  }

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>AI Command Assistant</h1><div className="sub">Predictive analysis · natural-language queries · autonomous recommendations</div></div>
        <div className="actions">
          <button className="btn ghost">History</button>
          <button className="btn">New session</button>
        </div>
      </div>
      <div className="two-col">
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
          <div className="card-h"><h3>Conversation</h3><div className="right" style={{ color: 'var(--secondary)' }}>● AquaMind v3.2</div></div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0' }}>
            {[...seedMsgs, ...extra].map((m, i) => (
              m.you
                ? <div className="msg you" key={i}>{m.you}</div>
                : <div className="msg ai" key={i}>{m.ai}</div>
            ))}
          </div>
          <div className="rp-quick">
            {chips.map(c => <span className="chip" key={c} onClick={() => send(c)}>{c}</span>)}
          </div>
          <div className="rp-input">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), send())}
              placeholder="Ask anything about the water network…"
            />
            <button className="rp-send" onClick={() => send()} aria-label="Send">↑</button>
          </div>
        </div>
        <div>
          <div className="card glass" style={{ marginBottom: 10 }}>
            <div className="card-h"><h3>Today's AI Recommendations</h3><div className="right">41 issued</div></div>
            {recs.map((r, i) => (
              <div className={'alert-item ' + r.tone} key={i}>
                <div className="t">{r.t}</div>
                <div className="m"><span>{r.m1}</span><span style={{ color: r.onAcc ? 'var(--secondary)' : 'var(--surface-tint)' }}>{r.m2}</span></div>
              </div>
            ))}
          </div>
          <div className="card glass">
            <div className="card-h"><h3>Model Performance · 7d</h3><div className="right">MAPE 4.8%</div></div>
            <svg viewBox="0 0 280 110" width="100%" height="110">
              <polyline fill="none" stroke="#4edea3" strokeWidth="1.6" points="0,80 30,72 60,76 90,60 120,64 150,52 180,56 210,42 240,46 270,32" />
              <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" strokeDasharray="3 3" points="0,84 30,76 60,70 90,68 120,58 150,60 180,50 210,52 240,40 270,38" />
            </svg>
            <div style={{ display: 'flex', gap: 12, marginTop: 6, font: "500 9px/12px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              <span><span style={{ color: 'var(--secondary)' }}>—</span> Predicted</span>
              <span><span style={{ color: 'var(--surface-tint)' }}>- -</span> Actual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
