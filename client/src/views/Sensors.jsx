import React, { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

const sigPill = s => s === 'offline' ? 'pill crit' : s === 'weak' ? 'pill warn' : 'pill ok';
const batPill = b => b < 15 ? 'pill crit' : b < 30 ? 'pill warn' : b > 70 ? 'pill ok' : 'pill info';

/* Sensors — full original chrome (donut, battery bars, signal chart) +
   live API table. */
export default function Sensors() {
  const sensors = useApi(api.sensors);
  const [q, setQ] = useState('');

  const list = useMemo(() => (sensors.data && sensors.data.sensors) || [], [sensors.data]);
  const filtered = useMemo(() => list.filter(s =>
    !q || s.id.toLowerCase().includes(q.toLowerCase()) || s.lakeName.toLowerCase().includes(q.toLowerCase())
  ), [list, q]);

  const counts = useMemo(() => {
    const c = { good: 0, weak: 0, offline: 0 };
    list.forEach(s => { c[s.signal] = (c[s.signal] || 0) + 1; });
    return c;
  }, [list]);

  const batteryBuckets = useMemo(() => {
    const b = { crit: 0, low: 0, mid: 0, high: 0 };
    list.forEach(s => {
      if (s.battery < 15) b.crit++;
      else if (s.battery < 30) b.low++;
      else if (s.battery < 70) b.mid++;
      else b.high++;
    });
    return b;
  }, [list]);

  const total = list.length;
  const sw = (n) => total ? (n / total * 314.159).toFixed(2) : 0;

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Sensor Network</h1><div className="sub">{total} active probes · {counts.offline} offline · {counts.weak} maintenance · last refresh 4s ago</div></div>
        <div className="actions"><button className="btn">Calibrate All</button><button className="btn pri">+ Add Sensor</button></div>
      </div>

      <div className="chart-grid-3">
        <div className="card glass">
          <div className="card-h"><h3>Sensor Status</h3><div className="right">{total} total</div></div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <svg viewBox="0 0 200 200" width="170" height="170">
              <circle cx="100" cy="100" r="70" stroke="#4edea3" strokeWidth="20" fill="none" strokeDasharray={`${sw(counts.good)} 440`} transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#ffb690" strokeWidth="20" fill="none" strokeDasharray={`${sw(counts.weak || 0)} 440`} strokeDashoffset={`-${sw(counts.good)}`} transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#ffb4ab" strokeWidth="20" fill="none" strokeDasharray={`${sw(counts.offline || 0)} 440`} strokeDashoffset={`-${sw(counts.good + (counts.weak || 0))}`} transform="rotate(-90 100 100)" />
              <text x="100" y="98" textAnchor="middle" fill="#dbe2fd" font="700 28px Geist">{counts.good}</text>
              <text x="100" y="118" textAnchor="middle" fill="#8a9299" font="500 10px JetBrains Mono">online</text>
            </svg>
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Signal Strength · 24h</h3><div className="right">avg -72dBm</div></div>
          <svg viewBox="0 0 320 180" width="100%" height="180">
            <defs>
              <linearGradient id="sigGrad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#89ceff" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#89ceff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline fill="url(#sigGrad)" stroke="none" points="0,180 0,90 30,84 60,108 90,72 120,96 150,60 180,84 210,52 240,76 270,42 300,68 320,52 320,180" />
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points="0,90 30,84 60,108 90,72 120,96 150,60 180,84 210,52 240,76 270,42 300,68 320,52" />
          </svg>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Battery Levels</h3><div className="right">62% &lt; 30d</div></div>
          <div>
            <div className="bar-row"><span className="nm">Critical &lt;15%</span><span className="track"><span className="fill crit" style={{ width: `${(batteryBuckets.crit / Math.max(1, total)) * 100}%` }} /></span><span className="v">{batteryBuckets.crit}</span></div>
            <div className="bar-row"><span className="nm">Low 15-30%</span><span className="track"><span className="fill warn" style={{ width: `${(batteryBuckets.low / Math.max(1, total)) * 100}%` }} /></span><span className="v">{batteryBuckets.low}</span></div>
            <div className="bar-row"><span className="nm">Mid 30-70%</span><span className="track"><span className="fill" style={{ width: `${(batteryBuckets.mid / Math.max(1, total)) * 100}%` }} /></span><span className="v">{batteryBuckets.mid}</span></div>
            <div className="bar-row"><span className="nm">Healthy &gt;70%</span><span className="track"><span className="fill ok" style={{ width: `${(batteryBuckets.high / Math.max(1, total)) * 100}%` }} /></span><span className="v">{batteryBuckets.high}</span></div>
          </div>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Sensor ID</th><th>Lake</th><th>Type</th><th>Coordinates</th><th>Last Reading</th><th>Signal</th><th>Battery</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', padding: 20 }}>{sensors.loading ? 'Loading…' : 'No sensors match.'}</td></tr>
            )}
            {filtered.map(s => (
              <tr key={s.id}>
                <td className="num" style={{ color: 'var(--surface-tint)' }}>{s.id}</td>
                <td className="label">{s.lakeName}</td>
                <td>{s.type}</td>
                <td className="num">{s.lat.toFixed(3)}, {s.lon.toFixed(3)}</td>
                <td className="num">{new Date(s.lastReading).toLocaleTimeString()}</td>
                <td><span className={sigPill(s.signal)}><span className="pip" />{s.signal}</span></td>
                <td className="num"><span className={batPill(s.battery)} style={{ padding: '2px 6px' }}>{s.battery}%</span></td>
                <td><span className={sigPill(s.signal)}><span className="pip" />{s.signal === 'offline' ? 'Offline' : s.signal === 'weak' ? 'Weak' : 'Active'}</span></td>
                <td className="row-actions">
                  <button className="iconbtn" title="Calibrate">⚙</button>
                  <button className="iconbtn" title="Open">→</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}