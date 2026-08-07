import React from 'react';

const programmes = [
  { title: 'Dal · INC-2814',             sub: 'Algal bloom · cleanup complete',         pct: 96, fillCls: 'ok',   fillW: '96%', day: 'Day 12 / 14', tone: 'on plan',     toneCol: 'var(--secondary)' },
  { title: 'Hussain Sagar · INC-2807',   sub: 'Sewage discharge · aerators active',    pct: 72, fillCls: '',     fillW: '72%', day: 'Day 22 / 38', tone: 'monitoring',  toneCol: 'var(--surface-tint)' },
  { title: 'Nakki · INC-2803',           sub: 'Cyanobacteria bloom · treatment ongoing', pct: 54, fillCls: 'warn', fillW: '54%', day: 'Day 18 / 42', tone: 'behind · 4d', toneCol: 'var(--tertiary-container)' },
  { title: 'Surajkund · INC-2798',       sub: 'Conductivity drift · plant restart',    pct: 68, fillCls: '',     fillW: '68%', day: 'Day 9 / 21',  tone: 'monitoring',  toneCol: 'var(--surface-tint)' },
  { title: 'Chilika · INC-2794',         sub: 'Sensor outage · false-positive anomaly', pct: 32, fillCls: 'crit', fillW: '32%', day: 'Day 6 / 24',  tone: 'hardware',    toneCol: 'var(--error)' },
  { title: 'Bhojtal · INC-2789',         sub: 'Turbidity spike · dredging scheduled',  pct: 88, fillCls: 'ok',   fillW: '88%', day: 'Day 28 / 32', tone: 'on plan',     toneCol: 'var(--secondary)' }
];

export default function Recovery() {
  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <div className="eyebrow">Post-incident · 30d rolling</div>
          <h1>Recovery Progress Tracking</h1>
          <div className="sub">6 active recovery plans · 18 closed in last 90 days · model v3.2</div>
        </div>
        <div className="actions">
          <button className="btn ghost">Compare</button>
          <button className="btn">Export brief</button>
          <button className="btn pri">+ New plan</button>
        </div>
      </div>
      <div className="recovery-kpi">
        <div className="rk-hero">
          <div className="rk-eyebrow">Active portfolio recovery</div>
          <div className="rk-big">62.4%</div>
          <div className="rk-sub">+14.2% over last 14d · on plan</div>
          <svg viewBox="0 0 320 80" className="rk-trend" preserveAspectRatio="none">
            <polyline fill="rgba(78,222,163,.18)" stroke="none" points="0,62 24,58 48,60 72,52 96,46 120,40 144,36 168,32 192,22 216,18 240,14 264,12 288,8 320,4 320,80 0,80" />
            <polyline fill="none" stroke="var(--secondary)" strokeWidth="2" points="0,62 24,58 48,60 72,52 96,46 120,40 144,36 168,32 192,22 216,18 240,14 264,12 288,8 320,4" />
          </svg>
        </div>
        <div className="rk-tile">
          <div className="eyebrow">Avg recovery rate</div>
          <div className="rk-num">3.8<span className="unit">%/d</span></div>
          <div className="rk-delta up">+0.4 vs prior period</div>
        </div>
        <div className="rk-tile">
          <div className="eyebrow">Plans on track</div>
          <div className="rk-num">5<span className="unit">/6</span></div>
          <div className="rk-delta warn">1 behind · Chilika sensors</div>
        </div>
        <div className="rk-tile">
          <div className="eyebrow">Est. closure</div>
          <div className="rk-num">17d</div>
          <div className="rk-delta">median · remaining 6 plans</div>
        </div>
      </div>
      <div className="two-col" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <div className="card glass">
          <div className="card-h"><h3>Active recovery · per lake</h3><div className="right">6 plans</div></div>
          <div className="recovery-list">
            {programmes.map((p, i) => (
              <div className="rl-row" key={i}>
                <div className="rl-nm">
                  <div className="rl-title">{p.title}</div>
                  <div className="rl-sub">{p.sub}</div>
                </div>
                <div className="rl-track">
                  <div className={'rl-fill ' + p.fillCls} style={{ width: p.fillW }} />
                  <span className="rl-pct">{p.pct}%</span>
                </div>
                <div className="rl-meta">
                  <span>{p.day}</span>
                  <span style={{ color: p.toneCol }}>{p.tone}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Before vs After · WQI</h3><div className="right">incident-anchored</div></div>
          <svg viewBox="0 0 360 220" width="100%" height="220" aria-label="Recovery WQI before-after chart">
            {[60, 100, 140, 180].map(y => (
              <line key={y} x1="20" x2="340" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            ))}
            {/* baseline target */}
            <line x1="20" y1="80" x2="340" y2="80" stroke="var(--secondary)" strokeWidth="1" strokeDasharray="6 4" />
            {/* "before" bars */}
            {[28, 34, 36, 42, 38, 31].map((v, i) => (
              <rect key={'b' + i} x={40 + i * 50} y={200 - v * 2} width="14" height={v * 2} fill="var(--error)" opacity="0.85" rx="2" />
            ))}
            {/* "after" bars */}
            {[78, 64, 70, 74, 68, 82].map((v, i) => (
              <rect key={'a' + i} x={56 + i * 50} y={200 - v * 2} width="14" height={v * 2} fill="var(--secondary)" opacity="0.85" rx="2" />
            ))}
            {/* lake labels */}
            {['Dal', 'Hussain', 'Nakki', 'Surajkund', 'Chilika', 'Bhojtal'].map((n, i) => (
              <text key={n} x={48 + i * 50} y="216" font="500 9px JetBrains Mono" fill="#8a9299" textAnchor="middle">{n}</text>
            ))}
          </svg>
          <div className="recover-legend">
            <span className="rl-item"><span className="rl-sw before" />WQI at incident</span>
            <span className="rl-item"><span className="rl-sw after" />WQI now</span>
            <span className="rl-item"><span className="rl-sw target" />Recovery target</span>
          </div>
          <div className="recover-stats">
            <div className="rs-tile"><div className="rs-l">WQI improved</div><div className="rs-v">+38.4</div></div>
            <div className="rs-tile"><div className="rs-l">Lakes recovered</div><div className="rs-v">18 / 24</div></div>
            <div className="rs-tile"><div className="rs-l">Mean days to recovery</div><div className="rs-v">26.4</div></div>
          </div>
        </div>
      </div>
    </div>
  );
}
