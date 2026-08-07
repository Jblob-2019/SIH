import React from 'react';

const recommendations = [
  { prio: '↑ 8%',  cls: 'high', txt: 'Add Tech-2 to Bellandur shift rotation',     meta: 'Cost +₹ 0.4L/mo · Risk ↓ 22% · ETA 2d' },
  { prio: '↑ 12%', cls: 'high', txt: 'Pre-position aerator barge at Hyderabad HQ', meta: 'Cost +₹ 1.2L/mo · Response ↓ 38% · ETA 5d' },
  { prio: '↓ 14%', cls: 'mid',  txt: 'Defer Chilika sensor replacement to Sep 12',  meta: 'Save ₹ 2.8L · Low risk · ETA 0d' },
  { prio: '↑ 6%',  cls: 'mid',  txt: 'Move Alpha-3 from Vembanad to Loktak',        meta: 'Risk ↓ 8% · No cost · ETA 1d' },
  { prio: '↓ 4%',  cls: 'low',  txt: 'Re-rate 7 sensors as scheduled-retire',       meta: 'Save ₹ 0.9L · Hardware end-of-life' }
];

const budget = [
  { nm: 'Field operations',   pct: 37, v: '₹ 6.8 Cr · 37%', col: 'var(--surface-tint)' },
  { nm: 'Sensors & hardware', pct: 24, v: '₹ 4.4 Cr · 24%', col: 'var(--secondary)' },
  { nm: 'Cleanup & mitigation', pct: 17, v: '₹ 3.1 Cr · 17%', col: 'var(--tertiary-container)' },
  { nm: 'Emergency reserve', pct: 13, v: '₹ 2.4 Cr · 13%', col: 'var(--error)' },
  { nm: 'Admin & training', pct: 9, v: '₹ 1.7 Cr · 9%', col: 'var(--surface-container-highest)' }
];

const schedule = [
  { date: '07 Aug 09:00', job: 'Calibrate pH probes', site: 'Dal',      owner: 'Tech-1',     ai: 'ok',   man: 'warn', delta: '-1', dCol: 'var(--secondary)' },
  { date: '07 Aug 11:00', job: 'Replace battery ×4',  site: 'Chilika',  owner: 'Tech-2',     ai: 'crit', man: '',     delta: '+2', dCol: 'var(--secondary)' },
  { date: '08 Aug 02:00', job: 'Firmware OTA',        site: 'Network',  owner: 'Auto',       ai: 'ok',   man: '',     delta: '0',  dCol: '' },
  { date: '09 Aug 10:00', job: 'Inspect buoy',        site: 'Bhojtal',  owner: 'Tech-3',     ai: 'warn', man: '',     delta: '+1', dCol: 'var(--tertiary-container)' },
  { date: '10 Aug 08:00', job: 'Replace OR-CTL-12',   site: 'Chilika',  owner: 'Tech-2',     ai: 'crit', man: 'crit', delta: '0',  dCol: '' },
  { date: '11 Aug 07:00', job: 'Cleaning · cameras',  site: 'Bellandur', owner: 'Tech-1',    ai: 'warn', man: '',     delta: '+1', dCol: 'var(--tertiary-container)' },
  { date: '12 Aug 14:00', job: 'Network re-key',      site: 'All regions', owner: 'Auto',    ai: 'ok',   man: 'warn', delta: '-1', dCol: 'var(--secondary)' },
  { date: '13 Aug 06:00', job: 'Dredging prep',       site: 'Bhojtal',  owner: 'Contractor', ai: 'crit', man: 'warn', delta: '+1', dCol: 'var(--secondary)' }
];

export default function Optimize() {
  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <div className="eyebrow" style={{ color: 'var(--secondary)' }}>AquaMind AI · live</div>
          <h1>AI Resource Optimization</h1>
          <div className="sub">Last retrain · 02 Aug · 4.2M decisions evaluated · confidence 91%</div>
        </div>
        <div className="actions">
          <button className="btn ghost">Simulate</button>
          <button className="btn">Why these?</button>
          <button className="btn pri">Apply recommendations</button>
        </div>
      </div>
      <div className="opt-kpi">
        <div className="ok-tile">
          <div className="eyebrow">Projected cost ↓</div>
          <div className="ok-num">₹ 4.2<span className="unit">Cr / yr</span></div>
          <div className="ok-delta up">vs manual baseline</div>
        </div>
        <div className="ok-tile">
          <div className="eyebrow">Response time ↓</div>
          <div className="ok-num">−38<span className="unit">%</span></div>
          <div className="ok-delta up">−14 min median</div>
        </div>
        <div className="ok-tile">
          <div className="eyebrow">Equipment util</div>
          <div className="ok-num">84<span className="unit">%</span></div>
          <div className="ok-delta up">+22 pts</div>
        </div>
        <div className="ok-tile">
          <div className="eyebrow">Manpower shift</div>
          <div className="ok-num">+11<span className="unit">FTE</span></div>
          <div className="ok-delta">from reactive to predictive</div>
        </div>
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card glass">
          <div className="card-h"><h3>Budget allocation · annual</h3><div className="right">₹ 18.4 Cr</div></div>
          <svg viewBox="0 0 220 220" width="100%" height="220" aria-label="Budget allocation donut chart">
            {/* donut segments: 37%, 24%, 17%, 13%, 9% */}
            {(() => {
              const segs = [37, 24, 17, 13, 9];
              const cols = ['var(--surface-tint)', 'var(--secondary)', 'var(--tertiary-container)', 'var(--error)', 'var(--surface-container-highest)'];
              let acc = 0;
              return segs.map((p, i) => {
                const start = acc / 100 * 360;
                acc += p;
                const end = acc / 100 * 360;
                const large = end - start > 180 ? 1 : 0;
                const r = 80, cx = 110, cy = 110;
                const x1 = cx + r * Math.cos((start - 90) * Math.PI / 180);
                const y1 = cy + r * Math.sin((start - 90) * Math.PI / 180);
                const x2 = cx + r * Math.cos((end - 90) * Math.PI / 180);
                const y2 = cy + r * Math.sin((end - 90) * Math.PI / 180);
                return (
                  <path key={i} d={`M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2}`} fill="none" stroke={cols[i]} strokeWidth="28" />
                );
              });
            })()}
            <text x="110" y="106" textAnchor="middle" fill="#dbe2fd" font="700 18px Geist, sans-serif">₹ 18.4 Cr</text>
            <text x="110" y="124" textAnchor="middle" fill="#8a9299" font="500 10px JetBrains Mono">FY 2026</text>
          </svg>
          <div className="budget-legend">
            {budget.map((b, i) => (
              <div className="bl-row" key={i}>
                <span className="bl-sw" style={{ background: b.col }} />
                <span className="bl-l">{b.nm}</span>
                <span className="bl-v">{b.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>AI deployment recommendations</h3><div className="right">5 active</div></div>
          {recommendations.map((r, i) => (
            <div className="rec-row" key={i}>
              <div className={'rec-prio ' + r.cls}>{r.prio}</div>
              <div>
                <div className="rec-txt">{r.txt}</div>
                <div className="rec-meta">{r.meta}</div>
              </div>
              <button className="btn small">Apply</button>
            </div>
          ))}
        </div>
      </div>
      <div className="card glass" style={{ marginTop: 12 }}>
        <div className="card-h"><h3>Maintenance schedule · AI-optimized · next 14d</h3><div className="right">32 jobs</div></div>
        <div className="tbl-wrap" style={{ border: 0, background: 'transparent' }}>
          <table className="tbl">
            <thead><tr><th>Date</th><th>Job</th><th>Site</th><th>Owner</th><th>AI priority</th><th>Manual priority</th><th>Δ</th></tr></thead>
            <tbody>
              {schedule.map((s, i) => (
                <tr key={i}>
                  <td className="num">{s.date}</td>
                  <td className="label">{s.job}</td>
                  <td>{s.site}</td>
                  <td>{s.owner}</td>
                  <td><span className={`pill ${s.ai}`}><span className="pip" />{s.ai === 'ok' ? 'Low' : s.ai === 'warn' ? 'Med' : 'High'}</span></td>
                  <td><span className={`pill ${s.man}`}><span className="pip" />{s.man === 'ok' ? 'Low' : s.man === 'warn' ? 'Med' : s.man === 'crit' ? 'High' : 'Low'}</span></td>
                  <td className="num" style={s.dCol ? { color: s.dCol } : undefined}>{s.delta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}