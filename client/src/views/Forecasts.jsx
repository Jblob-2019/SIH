import React, { useMemo } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

const riskBars = [
  { nm: 'Bellandur',     pct: 88, v: '88%', cls: 'crit', col: 'var(--error)' },
  { nm: 'Nakki',         pct: 72, v: '72%', cls: 'crit', col: 'var(--error)' },
  { nm: 'Surajkund',     pct: 64, v: '64%', cls: 'warn', col: 'var(--tertiary-container)' },
  { nm: 'Hussain Sagar', pct: 58, v: '58%', cls: 'warn', col: 'var(--tertiary-container)' },
  { nm: 'Bhojtal',       pct: 52, v: '52%', cls: 'warn', col: 'var(--tertiary-container)' },
  { nm: 'Vembanad',      pct: 34, v: '34%', cls: '',     col: 'var(--on-surface)' },
  { nm: 'Loktak',        pct: 28, v: '28%', cls: '',     col: 'var(--on-surface)' },
  { nm: 'Dal',           pct: 6,  v: '6%',  cls: 'ok',   col: 'var(--secondary)' }
];

export default function Forecasts() {
  const f = useApi(api.forecasts);
  const series = (f.data && f.data.forecasts) || [];

  // WQI from forecast data: peaks rising trend
  const wqiPts = useMemo(() => {
    if (!series.length) return '0,150 60,120 120,140 180,90 240,110 300,70 360,90 420,60 480,80 540,40 600,30';
    return series.map((d, i) => {
      const wqi = (d.do_mgL * 8) + (d.ph * 6) - (d.turbidity_ntu * 0.6);
      const x = i * (600 / Math.max(1, series.length - 1));
      const y = 220 - Math.max(20, Math.min(180, wqi * 7));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [series]);

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Forecasts</h1><div className="sub">7-day WQI projections · ensemble model v2.4 · 412 lakes</div></div>
        <div className="actions"><button className="btn">Recalibrate</button><button className="btn pri">Run scenario</button></div>
      </div>
      <div className="chart-grid">
        <div className="card glass">
          <div className="card-h"><h3>National WQI · 7d Forecast vs Actual</h3><div className="right">CI 95%</div></div>
          <svg viewBox="0 0 600 220" width="100%" height="220">
            <defs>
              <linearGradient id="fcG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#89ceff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#89ceff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon fill="rgba(137,206,255,0.10)" points="0,150 60,120 120,140 180,90 240,110 300,70 360,90 420,60 480,80 540,40 600,30  600,210 540,210 480,210 420,210 360,210 300,210 240,210 180,210 120,210 60,210 0,210" />
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points={wqiPts} />
            <polyline fill="url(#fcG)" stroke="none" points={'0,220 ' + wqiPts + ' 600,220'} />
          </svg>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Risk Trajectory</h3><div className="right">next 72h</div></div>
          <div>
            {riskBars.map(r => (
              <div className="bar-row" key={r.nm}>
                <span className="nm">{r.nm}</span>
                <span className="track"><span className={'fill ' + r.cls} style={{ width: `${r.pct}%` }} /></span>
                <span className="v" style={{ color: r.col }}>{r.v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="card glass">
        <div className="card-h"><h3>Scenario Modeling</h3><div className="right">ensemble n=200</div></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 8 }}>
          <div style={{ padding: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--r)' }}>
            <div style={{ font: "500 10px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Baseline</div>
            <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 6 }}>WQI 72.1</div>
            <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', marginTop: 4 }}>National · 7d projection</div>
            <div style={{ height: 6, background: 'var(--surface-container-high)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '72%', background: 'var(--secondary)' }} /></div>
          </div>
          <div style={{ padding: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--r)' }}>
            <div style={{ font: "500 10px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tertiary-container)' }}>+ Heatwave 5d</div>
            <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 6, color: 'var(--tertiary-container)' }}>WQI 64.8</div>
            <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', marginTop: 4 }}>-7.3 pts · 12 lakes → critical</div>
            <div style={{ height: 6, background: 'var(--surface-container-high)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '65%', background: 'var(--tertiary-container)' }} /></div>
          </div>
          <div style={{ padding: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--r)' }}>
            <div style={{ font: "500 10px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--error)' }}>Heavy Monsoon 7d</div>
            <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 6, color: 'var(--error)' }}>WQI 58.2</div>
            <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', marginTop: 4 }}>-13.9 pts · runoff load +28%</div>
            <div style={{ height: 6, background: 'var(--surface-container-high)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: '58%', background: 'var(--error)' }} /></div>
          </div>
        </div>
      </div>
    </div>
  );
}
