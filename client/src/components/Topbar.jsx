import React, { useEffect, useState } from 'react';

export default function Topbar({ active }) {
  const [clock, setClock] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const title = TITLES[active] || active;
  const dateStr = clock.toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
  const timeStr = clock.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

  return (
    <header className="topbar">
      <div className="crumbs">
        <span>AquaMind</span>
        <span className="sep">/</span>
        <span>{title}</span>
        <span className="sep">/</span>
        <span className="now">{title}</span>
      </div>
      <div className="searchbox">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/>
        </svg>
        <input placeholder="Search lakes, sensors, incidents…" />
        <span className="kbd">⌘ K</span>
      </div>
      <div className="top-actions">
        <button className="iconbtn" title="All-call" id="emergencyAllCall">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
          <span className="dot" />
        </button>
        <button className="iconbtn" title="Notifications">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
        </button>
        <span className="divline" />
        <div style={{ textAlign: 'right' }}>
          <div className="clock">{timeStr}</div>
          <div className="date">{dateStr}</div>
        </div>
      </div>
    </header>
  );
}

const TITLES = {
  dashboard: 'Operations Overview',
  map: 'Live GIS Map',
  sensors: 'Sensor Network',
  lakes: 'Lakes',
  forecasts: 'Forecasts',
  anomalies: 'Anomalies',
  biodiversity: 'Biodiversity',
  analytics: 'Analytics',
  incidents: 'Incidents',
  emergency: 'Emergency',
  optimize: 'AI Optimize',
  recovery: 'Recovery',
  maintenance: 'Maintenance',
  citizen: 'Citizen Reports',
  reports: 'Reports',
  assistant: 'AI Assistant',
  admin: 'Administration'
};