import React from 'react';

const flashes = [
  { id: 'FA-2204', t: '14:31', tone: 'crit', lake: 'Bellandur',     body: 'industrial discharge 220 L/min from S-04 · foam overflow imminent', sev: 'SEV-1', off: '5 officers dispatched', eta: 'ETA 38m' },
  { id: 'FA-2203', t: '14:14', tone: 'crit', lake: 'Hussain Sagar', body: 'pH 4.8 · algal bloom spreading NE 8 km/h',                       sev: 'SEV-1', off: '3 officers',          eta: 'ETA 22m' },
  { id: 'FA-2202', t: '13:58', tone: 'warn', lake: 'Nakki',         body: 'cyanobacteria bloom · 4.2× safe level',                          sev: 'SEV-2', off: '2 officers',          eta: 'ETA 51m' },
  { id: 'FA-2201', t: '13:14', tone: '',    lake: 'Surajkund',     body: 'conductivity drift · treatment failure suspected',               sev: 'SEV-3', off: '1 officer',           eta: 'ETA 1h 18m' }
];

const dispatch = [
  { av: 'RK', nm: 'R. Kapoor', role: 'CMD Officer L2',     where: 'Bellandur',     cls: 'crit', eta: 'ETA 38m' },
  { av: 'MI', nm: 'M. Iyer',   role: 'Field Lead · South', where: 'Hussain Sagar', cls: 'crit', eta: 'ETA 22m' },
  { av: 'VS', nm: 'V. Singh',  role: 'Field Lead · North', where: 'Nakki',         cls: 'warn', eta: 'ETA 51m' },
  { av: 'PN', nm: 'P. Nair',   role: 'Field Tech · West',  where: 'Surajkund',     cls: '',     eta: 'ETA 1h 18m' },
  { av: 'SR', nm: 'S. Reddy',  role: 'Field Tech · South', where: 'Hussain Sagar', cls: 'crit', eta: 'ETA 22m' },
  { av: 'KD', nm: 'K. Das',    role: 'Field Tech · East',  where: 'Standby',       cls: '',     eta: '—' },
  { av: 'DP', nm: 'D. Patel',  role: 'Field Tech · West',  where: 'Standby',       cls: '',     eta: '—' },
  { av: 'AS', nm: 'A. Sharma', role: 'Analyst',            where: 'Command',       cls: 'ok',   eta: 'now' }
];

const escalation = [
  { tone: 'crit', t: '14:31 · SEV-1 Bellandur escalated',     m: 'Auto · WQI breached 28.4 · foam overflow' },
  { tone: 'crit', t: '14:14 · SEV-1 Hussain Sagar pH 4.8',   m: 'Auto · sensor TS-HYD-C-01' },
  { tone: 'warn', t: '13:58 · SEV-2 Nakki bloom',             m: 'Auto · 4.2× safe · cyanobacteria' },
  { tone: 'warn', t: '13:14 · SEV-3 Surajkund conductivity',  m: 'Auto · sensor HR-FBD-S-04' },
  { tone: 'ok',   t: '11:30 · SEV-0 Dal resolved',            m: 'INC-2814 closed by Bravo-1' },
  { tone: 'warn', t: '09:22 · SEV-2 Chilika sensors ×2',     m: 'Auto · offline 12h+' },
  { tone: '',     t: '07:30 · SEV-3 Sambhar pH drift',       m: 'Auto · sensor RJ-SIR-N-02' }
];

const channels = [
  ['SMS blast · 12,847 citizens',     'Delivered',     'var(--secondary)'],
  ['WhatsApp · Bellandur ward 78',    'Delivered',     'var(--secondary)'],
  ['CPCB HQ · Delhi',                 'Acknowledged',  'var(--secondary)'],
  ['KSPCB · Karnataka',               'Acknowledged',  'var(--secondary)'],
  ['TSPCB · Telangana',               'Pending',       'var(--tertiary-container)'],
  ['District magistrate · BBMP',      'Acknowledged',  'var(--secondary)'],
  ['District magistrate · GHMC',      'Pending',       'var(--tertiary-container)'],
  ['Media & press release',           'Drafted',       '']
];

export default function Emergency() {
  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <div className="eyebrow" style={{ color: 'var(--error)' }}>Active protocol · SEV-2</div>
          <h1 style={{ color: 'var(--error)' }}>Emergency Mode</h1>
          <div className="sub">All-hands · Auto-escalation · Officer dispatch · Flash alerts</div>
        </div>
        <div className="actions">
          <button className="btn">All-call officers</button>
          <button className="btn pri">Confirm SEV-3 escalation</button>
        </div>
      </div>
      <div className="em-grid">
        <div className="card glass em-summary">
          <div className="card-h"><h3>Active flash alerts</h3><div className="right" style={{ color: 'var(--error)' }}>3 critical</div></div>
          {flashes.map(f => (
            <div className={'flash-card ' + f.tone} key={f.id}>
              <div className="fc-head"><span className="fc-id">{f.id}</span><span className="fc-time">{f.t}</span></div>
              <div className="fc-body"><strong>{f.lake}</strong> · {f.body}</div>
              <div className="fc-foot">
                <span className={'pill ' + (f.sev === 'SEV-1' ? 'crit' : f.sev === 'SEV-2' ? 'warn' : '')}><span className="pip" />{f.sev}</span>
                <span>{f.off}</span>
                <span>{f.eta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Officer dispatch board</h3><div className="right">12 assigned</div></div>
          {dispatch.map(d => (
            <div className="dispatch-row" key={d.av}>
              <div className="dr-avatar">{d.av}</div>
              <div className="dr-info">
                <div className="dr-nm">{d.nm}</div>
                <div className="dr-role">{d.role}</div>
              </div>
              <span className={'pill ' + d.cls}><span className="pip" />{d.where}</span>
              <span className="dr-eta">{d.eta}</span>
            </div>
          ))}
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Escalation timeline · 6h</h3><div className="right">auto</div></div>
          <div className="timeline">
            {escalation.map((e, i) => (
              <div className={'tl-item ' + e.tone} key={i}>
                <div className="t">{e.t}</div>
                <div className="m">{e.m}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Notification channels</h3><div className="right">all green</div></div>
          {channels.map(([l, v, col]) => (
            <div className="stat-line" key={l}>
              <span className="lbl">{l}</span>
              <span className="v" style={col ? { color: col } : undefined}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
