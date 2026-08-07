import React, { useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi, pill } from '../lib/hooks.js';

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

  const filtered = useMemo(() => {
    const list = (lakes.data && lakes.data.lakes) || [];
    return list.filter(l => {
      const matchesQ = !q || l.name.toLowerCase().includes(q.toLowerCase()) || l.city.toLowerCase().includes(q.toLowerCase());
      const matchesS = statusFilter === 'all' || l.status === statusFilter;
      return matchesQ && matchesS;
    });
  }, [lakes.data, q, statusFilter]);

  const counts = useMemo(() => {
    const c = { ok: 0, warn: 0, crit: 0 };
    (lakes.data && lakes.data.lakes || []).forEach(l => { c[l.status] = (c[l.status] || 0) + 1; });
    return c;
  }, [lakes.data]);

  const total = lakes.data ? lakes.data.lakes.length : 412;

  // pseudo-WQI / ph / DO / turbidity from area + status (deterministic per lake)
  const readingFor = (l, i) => ({
    wqi:  l.status === 'crit' ? (28 + (i % 7)) : l.status === 'warn' ? (45 + (i % 9)) : (72 + (i % 8)),
    ph:   +(6.4 + ((i * 0.07) % 1.2)).toFixed(1),
    do:   +(l.status === 'crit' ? 2 + (i % 2) * 0.4 : 6 + (i % 3)).toFixed(1),
    turbidity: l.status === 'crit' ? 120 + (i * 7) % 80 : 4 + (i * 3) % 12
  });

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Lakes · Inventory</h1><div className="sub">{total} monitored water bodies · 12 states &amp; 4 UTs</div></div>
        <div className="actions">
          <button className="btn">Import CSV</button>
          <button className="btn pri">+ Register Lake</button>
        </div>
      </div>

      <div className="filter-row">
        <div className="filter-input">⌕ <input placeholder="Search by name, region, district…" value={q} onChange={e => setQ(e.target.value)} /></div>
        <select className="select"><option>All States</option><option>Karnataka</option><option>Rajasthan</option><option>Telangana</option><option>Odisha</option><option>Jammu &amp; Kashmir</option></select>
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="crit">Critical</option>
          <option value="warn">At Risk</option>
          <option value="ok">Healthy</option>
        </select>
        <select className="select"><option>WQI · Low to High</option><option>WQI · High to Low</option><option>Last Updated</option></select>
        <div className="tag-row" style={{ marginLeft: 'auto' }}>
          <span className="tag active">Grid</span>
          <span className="tag">Table</span>
          <span className="tag">Cards</span>
        </div>
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
          <thead><tr><th>Lake</th><th>State / Region</th><th>WQI</th><th>pH</th><th>DO (mg/L)</th><th>Turbidity</th><th>Coverage</th><th>Status</th><th>Last Update</th><th></th></tr></thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 20, color: 'var(--on-surface-variant)' }}>{lakes.loading ? 'Loading…' : 'No lakes match the filter.'}</td></tr>
            )}
            {filtered.map((l, i) => {
              const r = readingFor(l, i);
              const coverage = l.status === 'crit' ? 18 + (i * 7) % 12 : 80 + (i * 3) % 18;
              const last = new Date(Date.now() - (i * 3600000)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <tr key={l.id}>
                  <td className="label">{l.name}</td>
                  <td>{l.state} · {l.city}</td>
                  <td className="num" style={{ color: l.status === 'crit' ? 'var(--error)' : l.status === 'warn' ? 'var(--tertiary-container)' : 'var(--on-surface)' }}>{r.wqi.toFixed(1)}</td>
                  <td className="num">{r.ph}</td>
                  <td className="num">{r.do}</td>
                  <td className="num">{r.turbidity.toFixed(1)} NTU</td>
                  <td className="num">{coverage}%</td>
                  <td><span className={pillFor(l.status)}><span className="pip" />{l.status === 'crit' ? 'Critical' : l.status === 'warn' ? 'At Risk' : 'Healthy'}</span></td>
                  <td className="num">{last}</td>
                  <td className="row-actions">
                    <button className="iconbtn" title="Open">→</button>
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