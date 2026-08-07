import React from 'react';

const backlogBars = [
  { nm: 'Battery replace',  pct: 64, v: 12, cls: '' },
  { nm: 'Calibration',      pct: 46, v: 8,  cls: '' },
  { nm: 'Firmware update',  pct: 24, v: 4,  cls: '' },
  { nm: 'Hardware repair',  pct: 18, v: 3,  cls: 'crit' }
];

const upcoming = [
  { tone: '',     t: 'Calibrate pH probes · Dal',         m: '07 Aug · 09:00 · Tech-1' },
  { tone: 'warn', t: 'Replace battery ×4 · Chilika',       m: '07 Aug · 11:00 · Tech-2' },
  { tone: '',     t: 'Firmware OTA · Network-wide',       m: '08 Aug · 02:00 · Auto' },
  { tone: '',     t: 'Inspect buoy · Bhojtal',            m: '09 Aug · 10:00 · Tech-3' },
  { tone: 'crit', t: 'Replace sensor OR-CTL-12',          m: '10 Aug · 08:00 · Tech-2' },
  { tone: '',     t: 'Cleaning · Bellandur cameras',      m: '11 Aug · 07:00 · Tech-1' }
];

export default function Maintenance() {
  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Maintenance</h1><div className="sub">17 offline sensors · 4 in repair · 6 scheduled this week</div></div>
        <div className="actions"><button className="btn">Schedule</button><button className="btn pri">+ Work order</button></div>
      </div>
      <div className="chart-grid-3">
        <div className="card glass">
          <div className="card-h"><h3>Sensor Uptime · 30d</h3><div className="right">target 99.5%</div></div>
          <svg viewBox="0 0 320 160" width="100%" height="160">
            <defs>
              <linearGradient id="mUpG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#4edea3" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4edea3" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="url(#mUpG)" stroke="none" points="0,160 0,40 40,30 80,50 120,30 160,20 200,30 240,15 280,10 320,12 320,160" />
            <polyline fill="none" stroke="#4edea3" strokeWidth="1.6" points="0,40 40,30 80,50 120,30 160,20 200,30 240,15 280,10 320,12" />
            <line x1="0" y1="20" x2="320" y2="20" stroke="rgba(255,255,255,0.1)" strokeDasharray="3 4" />
          </svg>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Maintenance Backlog</h3><div className="right">27 open</div></div>
          <div>
            {backlogBars.map(b => (
              <div className="bar-row" key={b.nm}>
                <span className="nm">{b.nm}</span>
                <span className="track"><span className={'fill ' + b.cls} style={{ width: `${b.pct}%` }} /></span>
                <span className="v">{b.v}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Upcoming This Week</h3><div className="right">6 jobs</div></div>
          {upcoming.map((u, i) => (
            <div className={'tl-item ' + u.tone} key={i}>
              <div className="t">{u.t}</div>
              <div className="m">{u.m}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
