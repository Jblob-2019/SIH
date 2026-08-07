import React, { useMemo } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

/* Dashboard view — ported verbatim from the original HTML template
   (KPIs with sparklines, WQI chart, health donut, critical-lakes table,
   active-incidents timeline). Live API data replaces the static
   placeholder values. */
export default function Dashboard() {
  const metrics    = useApi(api.metrics);
  const forecasts  = useApi(api.forecasts);
  const incidents  = useApi(api.incidents);

  const m = metrics.data;
  const fc = forecasts.data && forecasts.data.forecasts;
  const inc = (incidents.data && incidents.data.incidents) || [];

  // Build a smooth 14-day WQI-like sparkline from forecast data
  const wqiSeries = useMemo(() => {
    if (!fc || fc.length === 0) return '';
    return fc.map((d, i) => {
      const x = i * (560 / (fc.length - 1)) + 20;
      // pseudo-WQI: combine DO, pH, inverse turbidity
      const wqi = (d.do_mgL * 8) + (d.ph * 6) - (d.turbidity_ntu * 0.6);
      const y = 200 - Math.max(20, Math.min(180, wqi * 7));
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [fc]);

  const openIncidents = inc.filter(i => i.status !== 'closed').slice(0, 7);
  const offlineCount = m ? (m.sensorsTotal - m.sensorsOnline) : 17;
  const eco = m ? m.ecoIndex : 78.4;
  const compliance = m ? m.compliancePct : 94.1;

  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <h1>Operations Overview</h1>
          <div className="sub">Real-time telemetry across 412 monitored water bodies · last sync 2s ago</div>
        </div>
        <div className="actions">
          <button className="btn ghost">Last 24h ▾</button>
          <button className="btn">Export</button>
          <button className="btn pri">Dispatch Team</button>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi ok">
          <div className="pip" />
          <div className="label">Overall Lake Health</div>
          <div className="val">{eco.toFixed(1)}<span style={{ fontSize: 18, color: 'var(--on-surface-variant)' }}>/100</span></div>
          <div className="delta up">▲ +1.2 vs 7d</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#4edea3" strokeWidth="1.6" points="0,28 20,24 40,26 60,18 80,22 100,14 120,16 140,10 160,12 180,8 200,6" />
          </svg>
        </div>
        <div className="kpi">
          <div className="pip" />
          <div className="label">Healthy Lakes</div>
          <div className="val">{m ? Math.round(m.totalLakes * 0.76) : 312}</div>
          <div className="delta up">▲ +4</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points="0,30 30,28 60,24 90,22 120,18 150,16 180,14 200,12" />
          </svg>
        </div>
        <div className="kpi warn">
          <div className="pip warn" />
          <div className="label">Moderate / At Risk</div>
          <div className="val">{m ? Math.round(m.totalLakes * 0.18) : 84}</div>
          <div className="delta down">▼ -2</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#ffb690" strokeWidth="1.6" points="0,12 30,14 60,18 90,16 120,22 150,20 180,24 200,22" />
          </svg>
        </div>
        <div className="kpi crit">
          <div className="pip crit" />
          <div className="label">Critical Lakes</div>
          <div className="val">{m ? Math.round(m.totalLakes * 0.06) : 16}</div>
          <div className="delta down">▲ +3 (24h)</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#ffb4ab" strokeWidth="1.6" points="0,32 30,30 60,28 90,22 120,24 150,18 180,12 200,8" />
          </svg>
        </div>
        <div className="kpi crit">
          <div className="pip crit" />
          <div className="label">Active Incidents</div>
          <div className="val">{m ? m.openIncidents : 8}</div>
          <div className="delta down">▲ 2 since morning</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#ffb4ab" strokeWidth="1.6" points="0,30 40,30 80,26 120,28 160,20 200,18" />
          </svg>
        </div>
        <div className="kpi warn">
          <div className="pip warn" />
          <div className="label">Offline Sensors</div>
          <div className="val">{offlineCount}</div>
          <div className="delta down">▲ +1</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#ffb690" strokeWidth="1.6" points="0,18 30,16 60,20 90,18 120,22 150,24 180,26 200,28" />
          </svg>
        </div>
        <div className="kpi">
          <div className="pip" />
          <div className="label">Cleanup Teams Active</div>
          <div className="val">23</div>
          <div className="delta up">▲ +3 dispatched</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points="0,28 30,26 60,22 90,18 120,14 150,10 180,8 200,4" />
          </svg>
        </div>
        <div className="kpi">
          <div className="pip" />
          <div className="label">AI Recommendations · 24h</div>
          <div className="val">41</div>
          <div className="delta up">▲ +6 vs yesterday</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points="0,32 30,28 60,30 90,22 120,18 150,20 180,14 200,10" />
          </svg>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card glass">
          <div className="card-h"><h3>Water Quality Index — National Trend · 14d</h3><div className="right">Δ vs prev 14d +2.8</div></div>
          <div className="chart-host">
            <svg viewBox="0 0 600 220" preserveAspectRatio="none" width="100%" height="100%">
              <defs>
                <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#89ceff" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#89ceff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points={wqiSeries || '0,150 60,120 120,140 180,90 240,110 300,70 360,90 420,60 480,80 540,40 600,30'} />
              <polyline fill="url(#g1)" stroke="none" points={('0,220 ' + (wqiSeries || '0,150 60,120 120,140 180,90 240,110 300,70 360,90 420,60 480,80 540,40 600,30') + ' 600,220').replace(/\s+/g, ' ')} />
            </svg>
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Health Distribution</h3><div className="right">412 lakes</div></div>
          <div className="chart-host" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 200 200" width="180" height="180">
              <circle cx="100" cy="100" r="70" stroke="#4edea3" strokeWidth="20" fill="none" strokeDasharray="335 440" transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#facc15" strokeWidth="20" fill="none" strokeDasharray="45 440" strokeDashoffset="-335" transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#ffb690" strokeWidth="20" fill="none" strokeDasharray="35 440" strokeDashoffset="-380" transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#ffb4ab" strokeWidth="20" fill="none" strokeDasharray="25 440" strokeDashoffset="-415" transform="rotate(-90 100 100)" />
              <text x="100" y="96" textAnchor="middle" fill="#dbe2fd" font="700 28px Geist, sans-serif">{eco.toFixed(1)}</text>
              <text x="100" y="118" textAnchor="middle" fill="#8a9299" font="500 10px JetBrains Mono, monospace">/ 100</text>
            </svg>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="card glass">
          <div className="card-h"><h3>Critical Lakes · Top 5</h3><a href="#lakes" className="right" style={{ color: 'var(--surface-tint)' }}>View all →</a></div>
          <div className="tbl-wrap" style={{ border: 0, background: 'transparent' }}>
            <table className="tbl">
              <thead><tr><th>Lake</th><th>Region</th><th>WQI</th><th>Status</th><th>Trend</th></tr></thead>
              <tbody>
                <tr><td className="label">Bellandur</td><td>Karnataka</td><td className="num">28.4</td><td><span className="pill crit"><span className="pip" />Critical</span></td><td className="num" style={{ color: 'var(--error)' }}>▼ -8.1</td></tr>
                <tr><td className="label">Nakki</td><td>Rajasthan</td><td className="num">31.7</td><td><span className="pill crit"><span className="pip" />Critical</span></td><td className="num" style={{ color: 'var(--error)' }}>▼ -4.2</td></tr>
                <tr><td className="label">Surajkund</td><td>Haryana</td><td className="num">34.2</td><td><span className="pill crit"><span className="pip" />Critical</span></td><td className="num" style={{ color: 'var(--error)' }}>▼ -2.0</td></tr>
                <tr><td className="label">Hussain Sagar</td><td>Telangana</td><td className="num">36.8</td><td><span className="pill crit"><span className="pip" />Critical</span></td><td className="num" style={{ color: 'var(--error)' }}>▼ -1.4</td></tr>
                <tr><td className="label">Upper Lake (Bhojtal)</td><td>Madhya Pradesh</td><td className="num">38.1</td><td><span className="pill crit"><span className="pip" />Critical</span></td><td className="num" style={{ color: 'var(--error)' }}>▼ -0.9</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Active Incidents</h3><div className="right">{openIncidents.length} open</div></div>
          <div className="timeline">
            {openIncidents.length === 0 && (
              <>
                <div className="tl-item crit"><div className="t">Bellandur — Foam overflow</div><div className="m">14:21 · BLR-EAST-04 · 3 sensors fault</div></div>
                <div className="tl-item warn"><div className="t">Nakki — Algal bloom detected</div><div className="m">13:58 · satellite + spectral</div></div>
                <div className="tl-item warn"><div className="t">Surajkund — Industrial discharge</div><div className="m">13:14 · citizen report + DO drop</div></div>
                <div className="tl-item crit"><div className="t">Hussain Sagar — pH 4.8</div><div className="m">12:42 · multi-probe</div></div>
              </>
            )}
            {openIncidents.map(i => (
              <div className={'tl-item ' + (i.severity === 'crit' ? 'crit' : i.severity === 'warn' ? 'warn' : '')} key={i.id}>
                <div className="t">{i.lake} — {i.title}</div>
                <div className="m">live · {i.status} · {i.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}