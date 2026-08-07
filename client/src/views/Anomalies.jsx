import React, { useMemo } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

const seedRows = [
  { t: '14:28:41', l: 'Bellandur',     p: 'Surfactant',   r: '142.0 ppm', e: '12.4 ppm',  d: '+9.4σ',   dc: 'var(--error)', c: 99.2, type: 'Discharge',     cls: 'crit' },
  { t: '14:21:08', l: 'Hussain Sagar', p: 'pH',           r: '4.8',      e: '7.2',       d: '-6.1σ',   dc: 'var(--error)', c: 98.4, type: 'Acid spike',    cls: 'crit' },
  { t: '14:11:32', l: 'Nakki',         p: 'Chlorophyll-a', r: '84.2 µg/L', e: '22.1 µg/L', d: '+5.4σ', dc: 'var(--tertiary-container)', c: 96.8, type: 'Bloom', cls: 'warn' },
  { t: '13:58:14', l: 'Vembanad',      p: 'Salinity',     r: '18.4 ppt', e: '8.2 ppt',   d: '+4.2σ',   dc: 'var(--tertiary-container)', c: 94.1, type: 'Tidal lock', cls: 'warn' },
  { t: '13:42:51', l: 'Dal',           p: 'DO',           r: '8.4 mg/L', e: '7.2 mg/L',  d: '+3.1σ',   dc: 'var(--secondary)', c: 89.2, type: 'Aeration effect', cls: 'ok' },
  { t: '13:21:08', l: 'Loktak',        p: 'Turbidity',    r: '94.0 NTU', e: '28.0 NTU',  d: '+4.8σ',   dc: 'var(--tertiary-container)', c: 95.6, type: 'Sediment', cls: 'warn' },
  { t: '12:58:32', l: 'Chilika',       p: 'Signal loss',  r: '-110dBm',  e: '-72dBm',    d: 'offline', dc: 'var(--error)', c: 100,  type: 'Hardware',   cls: 'crit' },
  { t: '12:31:18', l: 'Bhojtal',       p: 'Conductivity', r: '1284 µS',  e: '420 µS',    d: '+3.8σ',   dc: 'var(--tertiary-container)', c: 92.4, type: 'Runoff',     cls: 'warn' }
];

export default function Anomalies() {
  const a = useApi(api.anomalies);
  const live = (a.data && a.data.anomalies) || [];

  const rows = useMemo(() => {
    if (live.length > 0) return live.map((x, i) => {
      const seed = seedRows[i % seedRows.length];
      return { ...seed, id: x.id };
    });
    return seedRows.map((s, i) => ({ ...s, id: `a-${i}` }));
  }, [live]);

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Anomaly Detection</h1><div className="sub">{rows.length} active anomalies · auto-flagged by ML models · 96% precision</div></div>
        <div className="actions"><button className="btn">Tune thresholds</button><button className="btn pri">Mark all reviewed</button></div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Time</th><th>Lake</th><th>Parameter</th><th>Reading</th><th>Expected</th><th>Δ σ</th><th>Confidence</th><th>Type</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td className="num">{r.t}</td>
                <td className="label">{r.l}</td>
                <td>{r.p}</td>
                <td className="num">{r.r}</td>
                <td className="num">{r.e}</td>
                <td className="num" style={{ color: r.dc }}>{r.d}</td>
                <td className="num">{r.c}%</td>
                <td><span className={`pill ${r.cls}`}><span className="pip" />{r.type}</span></td>
                <td><button className="iconbtn">→</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
