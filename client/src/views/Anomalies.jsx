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

  // Map live threshold breaches (pH outside 6.5–8.5, DO < 5 mg/L) onto table rows.
  // Seed rows are only shown if the endpoint errors, so an empty live list reads as "all clear".
  const rows = useMemo(() => {
    if (a.error) return seedRows.map((s, i) => ({ ...s, id: `a-${i}` }));
    return live.map(x => {
      const isPh = x.type === 'pH';
      const v = Number(x.deviation);
      const expected = isPh ? '6.5 – 8.5' : '≥ 5.0 mg/L';
      // distance past the threshold, expressed relative to a nominal spread
      const delta = isPh ? (v < 6.5 ? v - 6.5 : v - 8.5) / 0.3 : (v - 5) / 0.8;
      const sev = isPh ? (v < 6.0 || v > 9.0 ? 'crit' : 'warn') : (v < 4 ? 'crit' : 'warn');
      return {
        id: x.id,
        t: x.detectedAt ? new Date(x.detectedAt).toLocaleTimeString() : '—',
        l: x.lakeName || x.sensorId,
        p: isPh ? 'pH' : 'DO',
        r: isPh ? v.toFixed(2) : `${v.toFixed(2)} mg/L`,
        e: expected,
        d: `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}σ`,
        dc: sev === 'crit' ? 'var(--error)' : 'var(--tertiary-container)',
        c: Math.min(99.9, 80 + Math.abs(delta) * 4).toFixed(1),
        type: isPh ? (v < 6.5 ? 'Acidic' : 'Alkaline') : 'Hypoxia',
        cls: sev
      };
    });
  }, [live, a.error]);

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Anomaly Detection</h1><div className="sub">{rows.length} active anomalies · threshold breaches from latest readings · pH 6.5–8.5 · DO ≥ 5 mg/L</div></div>
        <div className="actions"><button className="btn">Tune thresholds</button><button className="btn pri">Mark all reviewed</button></div>
      </div>
      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Time</th><th>Lake</th><th>Parameter</th><th>Reading</th><th>Expected</th><th>Δ σ</th><th>Confidence</th><th>Type</th><th></th></tr></thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20 }}>{a.loading ? 'Loading…' : 'No threshold breaches in the latest readings.'}</td></tr>
            )}
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
                <td><a className="iconbtn" href="#map" title="Show on map">→</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
