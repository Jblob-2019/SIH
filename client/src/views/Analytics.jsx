import React from 'react';

const regionalBars = [
  { nm: 'Karnataka', v: 52.3, pct: 48, cls: 'warn' },
  { nm: 'Rajasthan', v: 47.1, pct: 42, cls: 'warn' },
  { nm: 'Telangana', v: 39.8, pct: 34, cls: 'crit' },
  { nm: 'Haryana',   v: 42.2, pct: 36, cls: 'crit' },
  { nm: 'Odisha',    v: 71.4, pct: 68, cls: '' },
  { nm: 'Kerala',    v: 78.2, pct: 76, cls: 'ok' },
  { nm: 'J&K',       v: 84.6, pct: 82, cls: 'ok' },
  { nm: 'Manipur',   v: 66.4, pct: 62, cls: '' }
];

const kpiMovement = [
  { l: 'Avg Turbidity',      v: '▼ -12%', col: 'var(--secondary)' },
  { l: 'Avg Dissolved O₂',   v: '▲ +4%',  col: 'var(--secondary)' },
  { l: 'Nitrate load',       v: '▲ +8%',  col: 'var(--error)' },
  { l: 'pH variance',        v: '▲ +2%',  col: 'var(--tertiary-container)' },
  { l: 'Surface temp',       v: '▼ -0.4°C', col: 'var(--secondary)' },
  { l: 'Sensor uptime',      v: '▲ +0.6%', col: 'var(--secondary)' },
  { l: 'Citizen reports',    v: '▲ +14%', col: 'var(--surface-tint)' },
  { l: 'MTTR',               v: '▼ -22 min', col: 'var(--secondary)' }
];

export default function Analytics() {
  // 90d WQI national average — slight upward drift
  const wqi90 = '0,140 20,128 60,134 100,118 140,122 180,108 220,114 260,98 300,90 320,86';
  const phDO  = '0,150 30,138 60,120 90,110 120,90 150,80 180,58 210,46 240,32 270,18 300,8 320,4';
  const params = '0,180 24,170 48,176 72,160 96,166 120,148 144,154 168,138 192,144 216,128 240,118 264,124 288,108 312,114 336,98 360,92 384,98 408,82 432,74 456,80 480,62 504,66 528,48 552,52 576,38 600,32';

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Analytics</h1><div className="sub">Historical trends · regional comparisons · parameter correlations</div></div>
        <div className="actions">
          <select className="select" style={{ background: 'var(--surface-container)', color: 'var(--on-surface)', padding: '7px 28px 7px 10px' }}><option>Last 90 days</option><option>Last 30 days</option><option>Year to date</option></select>
          <button className="btn">Compare</button>
          <button className="btn pri">Export</button>
        </div>
      </div>
      <div className="chart-grid-3">
        <div className="card glass">
          <div className="card-h"><h3>WQI · National Avg</h3><div className="right">90d</div></div>
          <svg viewBox="0 0 320 160" width="100%" height="160">
            <defs>
              <linearGradient id="anG1" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#89ceff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#89ceff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points={wqi90} />
            <polyline fill="url(#anG1)" stroke="none" points={'0,160 ' + wqi90 + ' 320,160'} />
          </svg>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>pH vs DO Correlation</h3><div className="right">r = -0.71</div></div>
          <svg viewBox="0 0 320 160" width="100%" height="160">
            <line x1="0" y1="80" x2="320" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            <line x1="0" y1="40" x2="320" y2="40" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            <line x1="0" y1="120" x2="320" y2="120" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            {Array.from({ length: 30 }).map((_, i) => (
              <circle key={i} cx={10 + i * 10} cy={140 - (i * 3.4) - Math.sin(i) * 10} r="2.4" fill="#89ceff" opacity="0.6" />
            ))}
            <polyline fill="none" stroke="#4edea3" strokeWidth="1.6" points={phDO} />
          </svg>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Regional Averages</h3><div className="right">by state</div></div>
          <div>
            {regionalBars.map(r => (
              <div className="bar-row" key={r.nm}>
                <span className="nm">{r.nm}</span>
                <span className="track"><span className={'fill ' + r.cls} style={{ width: `${r.pct}%` }} /></span>
                <span className="v">{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="two-col">
        <div className="card glass">
          <div className="card-h"><h3>Parameter Trends · Lake Health Drivers</h3><div className="right">normalized</div></div>
          <svg viewBox="0 0 600 220" width="100%" height="220">
            <defs>
              <linearGradient id="anG3a" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#4edea3" stopOpacity=".3" /><stop offset="100%" stopColor="#4edea3" stopOpacity="0" /></linearGradient>
              <linearGradient id="anG3b" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#89ceff" stopOpacity=".3" /><stop offset="100%" stopColor="#89ceff" stopOpacity="0" /></linearGradient>
            </defs>
            <polyline fill="none" stroke="#4edea3" strokeWidth="1.6" points={params} />
            <polyline fill="url(#anG3a)" stroke="none" points={'0,220 ' + params + ' 600,220'} />
            <polyline fill="none" stroke="#ffb690" strokeWidth="1.6" points="0,80 60,90 120,76 180,86 240,72 300,80 360,66 420,72 480,58 540,64 600,50" />
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" strokeDasharray="3 3" points="0,120 60,118 120,124 180,108 240,114 300,100 360,104 420,92 480,98 540,84 600,88" />
          </svg>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Top KPIs · Movement</h3><div className="right">14d</div></div>
          {kpiMovement.map(k => (
            <div className="stat-line" key={k.l}><span className="lbl">{k.l}</span><span className="v" style={{ color: k.col }}>{k.v}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
