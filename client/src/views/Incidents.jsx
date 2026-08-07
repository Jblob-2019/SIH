import React, { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

const sevPill = s => s === 'crit' ? 'pill crit' : s === 'warn' ? 'pill warn' : 'pill mod';
const statusPill = s => {
  if (s === 'in progress') return 'pill warn';
  if (s === 'dispatched') return 'pill info';
  if (s === 'monitoring') return 'pill ok';
  if (s === 'closed') return 'pill ok';
  return 'pill';
};

const teams = [
  { av: 'A3', nm: 'Alpha-3',   ro: 'Bellandur · foam',      sts: 'EN ROUTE' },
  { av: 'B1', nm: 'Bravo-1',   ro: 'Hussain Sagar · pH',    sts: 'ON SITE' },
  { av: 'T2', nm: 'Tech-2',    ro: 'Chilika · sensor',      sts: 'EN ROUTE' },
  { av: 'C4', nm: 'Charlie-4', ro: 'Nakki · bloom',         sts: 'ON SITE' },
  { av: 'A1', nm: 'Alpha-1',   ro: 'Surajkund · discharge', sts: 'EN ROUTE' }
];

function elapsedMin(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  return h ? `${h}h ${m % 60}m` : `${m}m`;
}

function slaLeft(iso) {
  const opened = new Date(iso).getTime();
  const deadline = opened + 4 * 3600 * 1000;
  const left = deadline - Date.now();
  if (left <= 0) return 'overdue';
  const m = Math.floor(left / 60000);
  const h = Math.floor(m / 60);
  return `${String(h).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export default function Incidents() {
  const incidents = useApi(api.incidents);
  const [selectedId, setSelectedId] = useState(null);

  const list = useMemo(() => (incidents.data && incidents.data.incidents) || [], [incidents.data]);
  const counts = useMemo(() => {
    const c = { open: 0, crit: 0 };
    list.forEach(i => { if (i.status !== 'closed') c.open++; if (i.severity === 'crit') c.crit++; });
    return c;
  }, [list]);

  const selected = list.find(i => i.id === selectedId) || list[0];

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Incidents</h1><div className="sub">{counts.open} open · {counts.crit} critical · avg resolution 4h 12m</div></div>
        <div className="actions"><button className="btn">Assign Team</button><button className="btn pri">+ Report Incident</button></div>
      </div>
      <div className="two-col">
        <div>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>ID</th><th>Lake</th><th>Type</th><th>Severity</th><th>Opened</th><th>SLA</th><th>Team</th><th>Status</th></tr></thead>
              <tbody>
                {list.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: 20 }}>{incidents.loading ? 'Loading…' : 'No incidents.'}</td></tr>
                )}
                {list.map(inc => (
                  <tr key={inc.id} onClick={() => setSelectedId(inc.id)} style={{ cursor: 'pointer' }}>
                    <td className="num" style={{ color: 'var(--surface-tint)' }}>#{inc.id.replace(/^inc-/, 'INC-')}</td>
                    <td className="label">{inc.lake}</td>
                    <td>{inc.title}</td>
                    <td><span className={sevPill(inc.severity)}><span className="pip" />{inc.severity === 'crit' ? 'Critical' : inc.severity === 'warn' ? 'High' : 'Med'}</span></td>
                    <td>{elapsedMin(inc.openedAt)} ago</td>
                    <td className="num">{slaLeft(inc.openedAt)}</td>
                    <td>{inc.team || '—'}</td>
                    <td><span className={statusPill(inc.status)}><span className="pip" />{inc.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="card glass" style={{ marginBottom: 10 }}>
            <div className="card-h"><h3>{selected ? `Incident · ${selected.lake}` : 'Selected'}</h3><span className="right" style={{ color: 'var(--error)' }}>{selected ? (selected.severity || '').toUpperCase() : ''}</span></div>
            <div className="stat-line"><span className="lbl">Type</span><span className="v">{selected ? selected.title : '—'}</span></div>
            <div className="stat-line"><span className="lbl">Opened</span><span className="v">{selected ? new Date(selected.openedAt).toLocaleTimeString() : '—'}</span></div>
            <div className="stat-line"><span className="lbl">Team</span><span className="v">{selected ? (selected.team || 'Alpha-3 · 6 pax') : '—'}</span></div>
            <div className="stat-line"><span className="lbl">ETA on-site</span><span className="v">14:48</span></div>
            <div className="stat-line"><span className="lbl">AI confidence</span><span className="v" style={{ color: 'var(--surface-tint)' }}>94.2%</span></div>
            <div style={{ marginTop: 10, padding: 9, background: 'var(--surface-container-low)', borderRadius: 'var(--r)', font: '400 12px/17px Inter, sans-serif', color: 'var(--on-surface-variant)' }}>
              <strong style={{ color: 'var(--on-surface)' }}>Root cause hypothesis:</strong> Industrial surfactant discharge at S-12 outflow combined with low wind. Foam extent mapped at 1.4 ha. Aeration boats dispatched.
            </div>
            <div style={{ display: 'flex', gap: 5, marginTop: 10 }}>
              <button className="btn pri" style={{ flex: 1, justifyContent: 'center' }}>Acknowledge</button>
              <button className="btn" style={{ flex: 1, justifyContent: 'center' }}>Escalate</button>
            </div>
          </div>
          <div className="card glass">
            <div className="card-h"><h3>Active Field Teams</h3><div className="right">23 deployed</div></div>
            {teams.map(t => (
              <div className="team-card" key={t.av}>
                <div className="av">{t.av}</div>
                <div><div className="nm">{t.nm}</div><div className="ro">{t.ro}</div></div>
                <div className="sts">{t.sts}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
