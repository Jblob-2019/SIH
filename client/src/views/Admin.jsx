import React from 'react';

const users = [
  { name: 'R. Kapoor', role: 'CMD Officer L2', region: 'National', status: 'Online',  cls: 'ok',   last: 'now' },
  { name: 'M. Iyer',   role: 'Field Lead',     region: 'South',    status: 'Online',  cls: 'ok',   last: 'now' },
  { name: 'A. Sharma', role: 'Analyst',        region: 'National', status: 'Online',  cls: 'ok',   last: '2m' },
  { name: 'S. Reddy',  role: 'Field Tech',     region: 'South',    status: 'Field',   cls: 'info', last: '12m' },
  { name: 'P. Nair',   role: 'Field Tech',     region: 'West',     status: 'Field',   cls: 'info', last: '28m' },
  { name: 'V. Singh',  role: 'Field Lead',     region: 'North',    status: 'On call', cls: 'info', last: '1h' },
  { name: 'K. Das',    role: 'Field Tech',     region: 'East',     status: 'Offline', cls: '',     last: '3h' },
  { name: 'D. Patel',  role: 'Analyst',        region: 'West',     status: 'Offline', cls: '',     last: '6h' }
];

const integrations = [
  ['CPCB — Central Pollution Control Board', 'Connected',  'var(--secondary)'],
  ['ISRO Bhuvan (Satellite)',                 'Connected',  'var(--secondary)'],
  ['IMD Weather',                             'Connected',  'var(--secondary)'],
  ['BBMP — Bengaluru',                        'Connected',  'var(--secondary)'],
  ['MCGM — Mumbai',                           'Connected',  'var(--secondary)'],
  ['GHMC — Hyderabad',                        'Connected',  'var(--secondary)'],
  ['WhatsApp Business API',                   'Connected',  'var(--secondary)'],
  ['SMS Gateway (MSG91)',                     'Degraded',   'var(--tertiary-container)'],
  ['OpenAQ Global Feed',                      'Connected',  'var(--secondary)'],
  ['Slack — Ops Channel',                     'Connected',  'var(--secondary)']
];

const sysHealth = [
  ['API latency p95',    '128ms'],
  ['Ingestion rate',     '2,847 msg/s'],
  ['DB replication lag', '0.4s'],
  ['ML inference p99',   '214ms'],
  ['Storage · 30d',      '1.84 TB / 4 TB'],
  ['Uptime · 30d',       '99.94%', 'var(--secondary)']
];

export default function Admin() {
  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Administration</h1><div className="sub">Users · roles · integrations · system</div></div>
        <div className="actions"><button className="btn">Audit log</button><button className="btn pri">+ Invite user</button></div>
      </div>
      <div className="two-col">
        <div className="card glass">
          <div className="card-h"><h3>Users · {users.length}</h3><div className="right">3 online now</div></div>
          <div className="tbl-wrap" style={{ border: 0, background: 'transparent' }}>
            <table className="tbl">
              <thead><tr><th>Name</th><th>Role</th><th>Region</th><th>Status</th><th>Last seen</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.name}>
                    <td className="label">{u.name}</td>
                    <td>{u.role}</td>
                    <td>{u.region}</td>
                    <td><span className={`pill ${u.cls}`}><span className="pip" />{u.status}</span></td>
                    <td className="num">{u.last}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="card glass" style={{ marginBottom: 10 }}>
            <div className="card-h"><h3>Integrations</h3><div className="right">12 active</div></div>
            {integrations.map(([name, status, col]) => (
              <div className="stat-line" key={name}>
                <span className="lbl">{name}</span>
                <span className="v" style={{ color: col }}>{status}</span>
              </div>
            ))}
          </div>
          <div className="card glass">
            <div className="card-h"><h3>System Health</h3><div className="right">all green</div></div>
            {sysHealth.map(([l, v, col]) => (
              <div className="stat-line" key={l}><span className="lbl">{l}</span><span className="v" style={col ? { color: col } : undefined}>{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
