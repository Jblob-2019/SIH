import React from 'react';

const recent = [
  { t: 'National Daily Brief',   type: 'PDF',        p: '06 Aug 2026', a: 'Auto',         g: '06:00 IST',  s: '1.4 MB', cls: 'ok',   st: 'Sent' },
  { t: 'Weekly Sensor Health',   type: 'XLSX',       p: 'Week 31',     a: 'R. Kapoor',    g: '05 Aug 18:00', s: '428 KB', cls: 'info', st: 'Draft' },
  { t: 'Bellandur — Foam Analysis', type: 'MD',      p: '05 Aug 2026', a: 'AI Assistant', g: '05 Aug 22:14', s: '2.1 MB', cls: 'warn', st: 'Review' },
  { t: 'CPCB Quarterly Filing',  type: 'PDF + XLSX', p: 'Q2 2026',     a: 'Admin',        g: '02 Aug 14:00', s: '8.6 MB', cls: 'ok',   st: 'Submitted' },
  { t: 'South Zone Maintenance', type: 'PDF',        p: 'Jul 2026',    a: 'M. Iyer',      g: '31 Jul 11:30', s: '3.2 MB', cls: 'ok',  st: 'Filed' },
  { t: 'Citizen Report Audit',   type: 'XLSX',       p: 'Jul 2026',    a: 'Auto',         g: '30 Jul 23:00', s: '1.8 MB', cls: 'ok',  st: 'Filed' }
];

export default function Reports() {
  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Reports</h1><div className="sub">Daily digests · regulatory filings · custom exports</div></div>
        <div className="actions"><button className="btn">Templates</button><button className="btn pri">+ New Report</button></div>
      </div>
      <div className="chart-grid-3">
        <div className="card glass" style={{ cursor: 'pointer' }}>
          <div className="card-h"><h3>Daily National Brief</h3><div className="right">PDF · 8pp</div></div>
          <div style={{ height: 140, background: 'linear-gradient(135deg, var(--surface-container-high), var(--surface-container))', borderRadius: 'var(--r)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
            <div style={{ font: '600 38px/44px Geist, sans-serif', letterSpacing: '-.02em', color: 'var(--on-surface-variant)' }}>06.AUG</div>
          </div>
          <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Auto-generated 06:00 IST</div>
        </div>
        <div className="card glass" style={{ cursor: 'pointer' }}>
          <div className="card-h"><h3>State Compliance · Karnataka</h3><div className="right">XLSX · 4 tabs</div></div>
          <div style={{ height: 140, background: 'linear-gradient(135deg, var(--surface-container-high), var(--surface-container))', borderRadius: 'var(--r)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
            <div style={{ font: '600 22px/26px Geist, sans-serif', letterSpacing: '-.02em', color: 'var(--surface-tint)' }}>CPCB-Q2</div>
          </div>
          <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Submitted 02 Aug 2026</div>
        </div>
        <div className="card glass" style={{ cursor: 'pointer' }}>
          <div className="card-h"><h3>Incident Postmortem · #INC-2814</h3><div className="right">MD · 12pp</div></div>
          <div style={{ height: 140, background: 'linear-gradient(135deg, var(--surface-container-high), var(--surface-container))', borderRadius: 'var(--r)', display: 'grid', placeItems: 'center', marginBottom: 8 }}>
            <div style={{ font: '600 22px/26px Geist, sans-serif', letterSpacing: '-.02em', color: 'var(--secondary)' }}>RESOLVED</div>
          </div>
          <div style={{ font: "500 11px/14px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', letterSpacing: '.05em', textTransform: 'uppercase' }}>Dal · aeration 11h</div>
        </div>
      </div>
      <div className="card glass">
        <div className="card-h"><h3>Recent Reports</h3><div className="right">last 30d</div></div>
        <div className="tbl-wrap" style={{ border: 0, background: 'transparent' }}>
          <table className="tbl">
            <thead><tr><th>Title</th><th>Type</th><th>Period</th><th>Author</th><th>Generated</th><th>Size</th><th>Status</th></tr></thead>
            <tbody>
              {recent.map((r, i) => (
                <tr key={i}>
                  <td className="label">{r.t}</td>
                  <td>{r.type}</td>
                  <td>{r.p}</td>
                  <td>{r.a}</td>
                  <td>{r.g}</td>
                  <td className="num">{r.s}</td>
                  <td><span className={`pill ${r.cls}`}><span className="pip" />{r.st}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
