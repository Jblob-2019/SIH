import React, { useMemo } from 'react';
import { api } from '../lib/api.js';
import { useApi, wqiOf, statusLabel, forecastWqi, toPolyline } from '../lib/hooks.js';

/* Dashboard view — ported verbatim from the original HTML template
   (KPIs with sparklines, WQI chart, health donut, critical-lakes table,
   active-incidents timeline). Live API data replaces the static
   placeholder values. */
export default function Dashboard() {
  const metrics    = useApi(api.metrics);
  const forecasts  = useApi(api.forecasts);
  const incidents  = useApi(api.incidents);
  const lakes      = useApi(api.lakes);

  const m = metrics.data;
  const fc = forecasts.data && forecasts.data.forecasts;
  const inc = (incidents.data && incidents.data.incidents) || [];

  // Build a smooth 14-day WQI-like sparkline from forecast data
  const wqiSeries = useMemo(() => {
    if (!fc || fc.length === 0) return '';
    return toPolyline(fc.map(forecastWqi), { width: 560, x0: 20 }).points;
  }, [fc]);

  const lakeList = (lakes.data && lakes.data.lakes) || [];
  const health = useMemo(() => {
    const c = { ok: 0, warn: 0, crit: 0 };
    lakeList.forEach(l => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [lakeList]);
  const criticalLakes = useMemo(() => [...lakeList]
    .filter(l => l.status !== 'ok')
    .sort((a, b) => wqiOf(a) - wqiOf(b))
    .slice(0, 5), [lakeList]);
  const totalLakes = lakeList.length || (m ? m.totalLakes : 0);
  // donut arcs (circumference 2πr = 440 for r=70)
  const arc = n => (totalLakes ? (n / totalLakes) * 440 : 0);

  const allOpen = inc
    .filter(i => !['closed', 'resolved'].includes(String(i.status).toLowerCase()))
    .sort((a, b) => new Date(b.openedAt) - new Date(a.openedAt));
  const openIncidents = allOpen.slice(0, 7);
  const offlineCount = m ? (m.sensorsTotal - m.sensorsOnline) : 17;
  const eco = m ? m.ecoIndex : 78.4;
  const compliance = m ? m.compliancePct : 94.1;

  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <h1>Operations Overview</h1>
          <div className="sub">Real-time telemetry across {totalLakes} monitored water bodies{m && m.dataSource === 'offline' ? ' · offline data (database unreachable)' : ''}</div>
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
          <div className="val">{health.ok}</div>
          <div className="delta up">▲ +4</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" points="0,30 30,28 60,24 90,22 120,18 150,16 180,14 200,12" />
          </svg>
        </div>
        <div className="kpi warn">
          <div className="pip warn" />
          <div className="label">Moderate / At Risk</div>
          <div className="val">{health.warn}</div>
          <div className="delta down">▼ -2</div>
          <svg className="spark" viewBox="0 0 200 40" preserveAspectRatio="none">
            <polyline fill="none" stroke="#ffb690" strokeWidth="1.6" points="0,12 30,14 60,18 90,16 120,22 150,20 180,24 200,22" />
          </svg>
        </div>
        <div className="kpi crit">
          <div className="pip crit" />
          <div className="label">Critical Lakes</div>
          <div className="val">{health.crit}</div>
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
          <div className="card-h"><h3>Water Quality Index — Forecast Trend</h3><div className="right">{fc && fc.length ? `${fc.length}d · WQI ${forecastWqi(fc[0]).toFixed(1)} → ${forecastWqi(fc[fc.length - 1]).toFixed(1)}` : ''}</div></div>
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
          <div className="card-h"><h3>Health Distribution</h3><div className="right">{totalLakes} lakes</div></div>
          <div className="chart-host" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 200 200" width="180" height="180">
              <circle cx="100" cy="100" r="70" stroke="#4edea3" strokeWidth="20" fill="none" strokeDasharray={`${arc(health.ok)} 440`} transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#ffb690" strokeWidth="20" fill="none" strokeDasharray={`${arc(health.warn)} 440`} strokeDashoffset={-arc(health.ok)} transform="rotate(-90 100 100)" />
              <circle cx="100" cy="100" r="70" stroke="#ffb4ab" strokeWidth="20" fill="none" strokeDasharray={`${arc(health.crit)} 440`} strokeDashoffset={-arc(health.ok + health.warn)} transform="rotate(-90 100 100)" />
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
              <thead><tr><th>Lake</th><th>District</th><th>WQI</th><th>Status</th><th>Readings</th></tr></thead>
              <tbody>
                {criticalLakes.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 16 }}>{lakes.loading ? 'Loading…' : 'No lakes at risk.'}</td></tr>
                )}
                {criticalLakes.map(l => (
                  <tr key={l.id}>
                    <td className="label">{l.name}</td>
                    <td>{l.city}</td>
                    <td className="num">{wqiOf(l).toFixed(1)}</td>
                    <td><span className={'pill ' + l.status}><span className="pip" />{statusLabel(l.status)}</span></td>
                    <td className="num" style={{ color: 'var(--error)' }}>DO {l.dissolved_oxygen ?? '—'} · pH {l.ph ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>Active Incidents</h3><div className="right">{allOpen.length} open</div></div>
          <div className="timeline">
            {openIncidents.length === 0 && !incidents.data && (
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
                <div className="m">{new Date(i.openedAt).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {i.status} · {i.id}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}