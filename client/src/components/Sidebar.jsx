import React, { useState } from 'react';

/* ============================================================
   Sidebar — brand + nav + footer + live pill
   Preserves the exact design from the supplied HTML template.
   ============================================================ */
const NAV = [
  {
    head: 'Operations',
    items: [
      { id: 'dashboard',   label: 'Dashboard',        href: '#dashboard'   },
      { id: 'map',         label: 'Live Map',         href: '#map'         },
      { id: 'sensors',     label: 'Sensor Network',   href: '#sensors'     },
      { id: 'lakes',       label: 'Lakes',            href: '#lakes'       }
    ]
  },
  {
    head: 'Insights',
    items: [
      { id: 'forecasts',   label: 'Forecasts',        href: '#forecasts'   },
      { id: 'anomalies',   label: 'Anomalies',        href: '#anomalies'   },
      { id: 'biodiversity',label: 'Biodiversity',     href: '#biodiversity'},
      { id: 'analytics',   label: 'Analytics',        href: '#analytics'   }
    ]
  },
  {
    head: 'Response',
    items: [
      { id: 'incidents',   label: 'Incidents',        href: '#incidents'   },
      { id: 'emergency',   label: 'Emergency',        href: '#emergency'   },
      { id: 'optimize',    label: 'AI Optimize',      href: '#optimize'    },
      { id: 'recovery',    label: 'Recovery',         href: '#recovery'    },
      { id: 'maintenance', label: 'Maintenance',      href: '#maintenance' }
    ]
  },
  {
    head: 'Public',
    items: [
      { id: 'citizen',     label: 'Citizen Reports',  href: '#citizen'     },
      { id: 'reports',     label: 'Reports',          href: '#reports'     }
    ]
  },
  {
    head: 'Tools',
    items: [
      { id: 'assistant',   label: 'AI Assistant',     href: '#assistant'   },
      { id: 'admin',       label: 'Administration',   href: '#admin'       }
    ]
  }
];

// svg icons kept as JSX so they ship with the bundle
const Ico = ({ name }) => {
  const s = { width: 16, height: 16, fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' };
  switch (name) {
    case 'dashboard':  return (<svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>);
    case 'map':        return (<svg viewBox="0 0 24 24" {...s}><path d="M9 4l-6 2v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/></svg>);
    case 'sensor':     return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M2 12h3M19 12h3M12 2v3M12 19v3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>);
    case 'lake':       return (<svg viewBox="0 0 24 24" {...s}><path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>);
    case 'forecast':   return (<svg viewBox="0 0 24 24" {...s}><path d="M3 18l4-4 4 3 7-7"/><path d="M14 7h7v7"/></svg>);
    case 'anomaly':    return (<svg viewBox="0 0 24 24" {...s}><path d="M12 3l10 18H2L12 3z"/><path d="M12 9v5M12 17v.5"/></svg>);
    case 'bio':        return (<svg viewBox="0 0 24 24" {...s}><path d="M12 3v18M3 12h18"/><path d="M5 5l14 14M19 5L5 19"/></svg>);
    case 'analytics':  return (<svg viewBox="0 0 24 24" {...s}><rect x="4" y="11" width="3" height="9"/><rect x="10" y="6" width="3" height="14"/><rect x="16" y="14" width="3" height="6"/></svg>);
    case 'incident':   return (<svg viewBox="0 0 24 24" {...s}><path d="M12 2l9 16H3z"/><path d="M12 9v4M12 17v.5"/></svg>);
    case 'emergency':  return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>);
    case 'optimize':   return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/></svg>);
    case 'recovery':   return (<svg viewBox="0 0 24 24" {...s}><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v6h-6"/></svg>);
    case 'maint':      return (<svg viewBox="0 0 24 24" {...s}><path d="M14 4l6 6-4 4-6-6 4-4z"/><path d="M10 8l-7 7v5h5l7-7"/></svg>);
    case 'citizen':    return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>);
    case 'reports':    return (<svg viewBox="0 0 24 24" {...s}><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M8 8h8M8 12h8M8 16h5"/></svg>);
    case 'assistant':  return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 1 4 1 6 0"/></svg>);
    case 'admin':      return (<svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></svg>);
    default: return null;
  }
};

export default function Sidebar({ active, metrics, online, user, onLogout }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand" onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer' }} title="Toggle Sidebar">
        <div className="brand-mark">A</div>
        <div className="brand-text">
          <div className="t1">AquaMind</div>
          <div className="t2">Hydraulic Command</div>
        </div>
      </div>
      <nav className="nav">
        {NAV.map(group => {
          // Filter items based on role
          const filteredItems = group.items.filter(it => {
            if (!user || user.role === 'admin') return true;
            if (user.role === 'citizen') {
              return ['dashboard', 'map', 'lakes', 'citizen', 'biodiversity'].includes(it.id);
            }
            return false;
          });

          if (filteredItems.length === 0) return null;

          return (
          <div className="nav-group" key={group.head}>
            <div className="head">{group.head}</div>
            {filteredItems.map(it => {
              const badge = badgeFor(it.id, metrics);
              return (
                <a key={it.id}
                   href={it.href}
                   className={active === it.id ? 'active' : ''}
                   onClick={e => { e.preventDefault(); window.location.hash = it.href.slice(1); }}>
                  <span className="ico"><Ico name={iconFor(it.id)} /></span>
                  <span>{it.label}</span>
                  {badge && <span className={'badge ' + (badge.kind || 'info')}>{badge.text}</span>}
                </a>
              );
            })}
          </div>
          );
        })}
      </nav>
      <div className="side-foot">
        <div className="avatar">{user?.role === 'admin' ? 'RK' : 'CT'}</div>
        <div className="user-min" style={{ flex: 1 }}>
          <div className="nm">{user?.role === 'admin' ? 'R. Kapoor' : 'Citizen'}</div>
          <div className="ro">{user?.role === 'admin' ? 'CMD L2 · National' : 'Public Access'}</div>
        </div>
        <button className="btn small" onClick={onLogout} style={{ padding: '4px 8px', fontSize: 11 }}>Logout</button>
      </div>
      <div className="side-foot" style={{ borderTop: 'none', paddingTop: 0 }}>
        <div className="live-pill" title={online ? 'API reachable' : 'API unreachable'}>
          <span className="dot" style={online ? {} : { background: 'var(--error)', boxShadow: '0 0 6px var(--error)' }} />
          {online ? 'Live · API' : 'Offline'}
        </div>
      </div>
    </aside>
  );
}

function iconFor(id) {
  return id; // map by id; unknown IDs fall through to default
}

function badgeFor(id, m) {
  if (!m) return null;
  switch (id) {
    case 'sensors':   return { text: `${m.sensorsOnline}/${m.sensorsTotal}`, kind: 'ok' };
    case 'incidents': return { text: m.openIncidents,                         kind: 'crit' };
    case 'lakes':     return { text: m.totalLakes,                           kind: 'info' };
    case 'emergency': return { text: m.alertsToday,                          kind: 'crit' };
    default: return null;
  }
}