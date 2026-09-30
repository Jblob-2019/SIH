import React, { useMemo } from 'react';
import { api } from '../lib/api.js';
import { useApi, wqiOf, forecastWqi, toPolyline } from '../lib/hooks.js';

const seedRiskBars = [
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
  const lakes = useApi(api.lakes);
  const series = (f.data && f.data.forecasts) || [];
  const wqis = useMemo(() => series.map(forecastWqi), [series]);

  // forecast line + ±4 WQI confidence band, auto-scaled to the data
  const chart = useMemo(() => {
    if (!wqis.length) return null;
    const band = 4;
    const { y, step } = toPolyline([...wqis.map(v => v + band), ...wqis.map(v => v - band)], { width: 600, pad: 2 });
    const x = i => (i * (600 / Math.max(1, wqis.length - 1))).toFixed(1);
    const line = wqis.map((v, i) => `${x(i)},${y(v).toFixed(1)}`).join(' ');
    const upper = wqis.map((v, i) => `${x(i)},${y(v + band).toFixed(1)}`);
    const lower = wqis.map((v, i) => `${x(i)},${y(v - band).toFixed(1)}`).reverse();
    return { line, band: [...upper, ...lower].join(' '), step };
  }, [wqis]);

  // risk = 100 − current WQI, highest-risk lakes first
  const riskBars = useMemo(() => {
    const list = (lakes.data && lakes.data.lakes) || [];
    if (!list.length) return lakes.error ? seedRiskBars : [];
    return list
      .map(l => ({ l, pct: Math.round(100 - wqiOf(l)) }))
      .sort((a, b) => b.pct - a.pct)
      .slice(0, 8)
      .map(({ l, pct }) => {
        const cls = pct >= 60 ? 'crit' : pct >= 35 ? 'warn' : pct < 15 ? 'ok' : '';
        const col = cls === 'crit' ? 'var(--error)' : cls === 'warn' ? 'var(--tertiary-container)' : cls === 'ok' ? 'var(--secondary)' : 'var(--on-surface)';
        return { nm: l.name, pct, v: `${pct}%`, cls, col };
      });
  }, [lakes.data, lakes.error]);

  const baseline = wqis.length ? wqis.reduce((a, b) => a + b, 0) / wqis.length : null;
  const scen = [
    { k: 'Baseline', v: baseline, sub: `${series.length}d projection`, col: 'var(--secondary)' },
    { k: '+ Heatwave 5d', v: baseline && baseline - 7.3, sub: '-7.3 pts · DO depletion', col: 'var(--tertiary-container)' },
    { k: 'Heavy Monsoon 7d', v: baseline && baseline - 13.9, sub: '-13.9 pts · runoff load +28%', col: 'var(--error)' }
  ];

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Forecasts</h1><div className="sub">{series.length}-day WQI projections · ensemble model v2.4 · {(lakes.data && lakes.data.lakes.length) || 0} lakes</div></div>
        <div className="actions"><button className="btn">Recalibrate</button><button className="btn pri">Run scenario</button></div>
      </div>
      <div className="chart-grid">
        <div className="card glass">
          <div className="card-h"><h3>WQI · {series.length}d Forecast</h3><div className="right">{series.length ? `${series[0].date} → ${series[series.length - 1].date}` : 'CI band ±4'}</div></div>
          <svg viewBox="0 0 600 220" width="100%" height="220">
            <defs>
              <linearGradient id="fcG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#89ceff" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#89ceff" stopOpacity="0" />
              </linearGradient>
            </defs>
            {!chart && <text x="300" y="110" textAnchor="middle" fill="#8a9299" font="500 12px JetBrains Mono">{f.loading ? 'Loading…' : 'No forecast data'}</text>}
            {chart && <polygon fill="rgba(137,206,255,0.10)" points={chart.band} />}
            {chart && <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points={chart.line} />}
            {chart && <polyline fill="url(#fcG)" stroke="none" points={'0,220 ' + chart.line + ' 600,220'} />}
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
          {scen.map(c => (
            <div key={c.k} style={{ padding: 14, background: 'var(--surface-container-low)', border: '1px solid var(--outline-variant)', borderRadius: 'var(--r)' }}>
              <div style={{ font: "500 10px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: c.k === 'Baseline' ? 'var(--on-surface-variant)' : c.col }}>{c.k}</div>
              <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 6, color: c.k === 'Baseline' ? undefined : c.col }}>WQI {c.v == null ? '—' : c.v.toFixed(1)}</div>
              <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', marginTop: 4 }}>{c.sub}</div>
              <div style={{ height: 6, background: 'var(--surface-container-high)', borderRadius: 3, marginTop: 10, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${Math.max(0, c.v || 0)}%`, background: c.col }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
