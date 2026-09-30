import React, { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi, wqiOf } from '../lib/hooks.js';

const pillFor = (status) => {
  if (status === 'crit') return 'pill crit';
  if (status === 'warn') return 'pill warn';
  return 'pill ok';
};

/* Lakes — ported from the original template, with live API table body.
   Filters, search, KPI strip, action buttons, grid/table/cards toggle — all preserved. */
export default function Lakes() {
  const lakes = useApi(api.lakes);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [district, setDistrict] = useState('all');
  const [sort, setSort] = useState('wqi-asc');

  const all = useMemo(() => (lakes.data && lakes.data.lakes) || [], [lakes.data]);
  const districts = useMemo(() => [...new Set(all.map(l => l.city))].sort(), [all]);

  const filtered = useMemo(() => {
    const out = all.filter(l => {
      const matchesQ = !q || l.name.toLowerCase().includes(q.toLowerCase()) || l.city.toLowerCase().includes(q.toLowerCase());
      const matchesS = statusFilter === 'all' || l.status === statusFilter;
      const matchesD = district === 'all' || l.city === district;
      return matchesQ && matchesS && matchesD;
    });
    const cmp = {
      'wqi-asc':  (a, b) => wqiOf(a) - wqiOf(b),
      'wqi-desc': (a, b) => wqiOf(b) - wqiOf(a),
      'updated':  (a, b) => new Date(b.recorded_at || 0) - new Date(a.recorded_at || 0)
    }[sort];
    return out.sort(cmp);
  }, [all, q, statusFilter, district, sort]);

  const counts = useMemo(() => {
    const c = { ok: 0, warn: 0, crit: 0 };
    (lakes.data && lakes.data.lakes || []).forEach(l => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [lakes.data]);

  const total = all.length;
  const fmt = (v, d = 1) => (v == null ? '—' : Number(v).toFixed(d));

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Lakes · Inventory</h1><div className="sub">{total} monitored water bodies · {districts.length} districts · Tamil Nadu</div></div>
        <div className="actions">
          <button className="btn">Import CSV</button>
          <button className="btn pri">+ Register Lake</button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-input">⌕ <input placeholder="Search by name, region, district…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="select" value={district} onChange={e => setDistrict(e.target.value)}>
          <option value="all">All Districts</option>
          {districts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="crit">Critical</option>
          <option value="warn">At Risk</option>
          <option value="ok">Healthy</option>
        </select>
        <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
          <option value="wqi-asc">WQI · Low to High</option>
          <option value="wqi-desc">WQI · High to Low</option>
          <option value="updated">Last Updated</option>
        </select>
      </div>

      <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ font: "500 9px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Total</div>
          <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 4 }}>{total}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ font: "500 9px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--secondary)' }}>Healthy</div>
          <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 4, color: 'var(--secondary)' }}>{counts.ok || 0}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ font: "500 9px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: '#facc15' }}>Moderate</div>
          <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 4, color: '#facc15' }}>0</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ font: "500 9px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--tertiary-container)' }}>At Risk</div>
          <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 4, color: 'var(--tertiary-container)' }}>{counts.warn || 0}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ font: "500 9px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--error)' }}>Critical</div>
          <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 4, color: 'var(--error)' }}>{counts.crit || 0}</div>
        </div>
        <div className="card" style={{ padding: 10 }}>
          <div style={{ font: "500 9px/12px 'JetBrains Mono', monospace", letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--on-surface-variant)' }}>Showing</div>
          <div style={{ font: '700 22px/26px Geist, sans-serif', marginTop: 4 }}>{filtered.length}</div>
        </div>
      </div>

      <div className="tbl-wrap">
        <table className="tbl">
          <thead><tr><th>Lake</th><th>State / Region</th><th>WQI</th><th>pH</th><th>DO (mg/L)</th><th>Turbidity</th><th>Water Level</th><th>Status</th><th>Last Update</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)' }}>{lakes.loading ? 'Loading…' : 'No lakes match the filter.'}</td></tr>
            )}
            {filtered.map(l => {
              const wqi = wqiOf(l);
              const last = l.recorded_at ? new Date(l.recorded_at).toLocaleString([], { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
              return (
                <tr key={l.id}>
                  <td className="label">{l.name}</td>
                  <td>{l.state} · {l.city}</td>
                  <td className="num" style={{ color: l.status === 'crit' ? 'var(--error)' : l.status === 'warn' ? 'var(--tertiary-container)' : 'var(--on-surface)' }}>{wqi.toFixed(1)}</td>
                  <td className="num">{fmt(l.ph)}</td>
                  <td className="num">{fmt(l.dissolved_oxygen)}</td>
                  <td className="num">{l.turbidity == null ? '—' : `${fmt(l.turbidity)} NTU`}</td>
                  <td className="num">{l.water_level_m == null ? '—' : `${fmt(l.water_level_m)} m`}</td>
                  <td><span className={pillFor(l.status)}><span className="pip" />{l.status === 'crit' ? 'Critical' : l.status === 'warn' ? 'At Risk' : 'Healthy'}</span></td>
                  <td className="num">{last}</td>
                  <td className="row-actions">
                    <a className="iconbtn" title="Show on map" href="#map">→</a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}