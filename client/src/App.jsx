import React, { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Topbar   from './components/Topbar.jsx';

import Dashboard    from './views/Dashboard.jsx';
import Map          from './views/Map.jsx';
import Sensors      from './views/Sensors.jsx';
import Lakes        from './views/Lakes.jsx';
import Forecasts    from './views/Forecasts.jsx';
import Anomalies    from './views/Anomalies.jsx';
import Biodiversity from './views/Biodiversity.jsx';
import Analytics    from './views/Analytics.jsx';
import Incidents    from './views/Incidents.jsx';
import Emergency    from './views/Emergency.jsx';
import Optimize     from './views/Optimize.jsx';
import Recovery     from './views/Recovery.jsx';
import Maintenance  from './views/Maintenance.jsx';
import Citizen      from './views/Citizen.jsx';
import Reports      from './views/Reports.jsx';
import Assistant    from './views/Assistant.jsx';
import Admin        from './views/Admin.jsx';

import { api } from './lib/api.js';

const VIEWS = {
  dashboard: Dashboard,
  map: Map,
  sensors: Sensors,
  lakes: Lakes,
  forecasts: Forecasts,
  anomalies: Anomalies,
  biodiversity: Biodiversity,
  analytics: Analytics,
  incidents: Incidents,
  emergency: Emergency,
  optimize: Optimize,
  recovery: Recovery,
  maintenance: Maintenance,
  citizen: Citizen,
  reports: Reports,
  assistant: Assistant,
  admin: Admin
};

function getRoute() {
  const h = (window.location.hash || '#dashboard').slice(1);
  return VIEWS[h] ? h : 'dashboard';
}

export default function App() {
  const [route, setRoute] = useState(getRoute());
  const [metrics, setMetrics] = useState(null);
  const [online, setOnline] = useState(false);

  // hash-based routing
  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // initial fetch + retry until backend is reachable
  useEffect(() => {
    let cancelled = false;
    let timer;
    const tick = () => {
      api.health()
        .then(() => {
          if (cancelled) return;
          setOnline(true);
          return api.metrics();
        })
        .then(m => { if (!cancelled && m) setMetrics(m); })
        .catch(() => { if (!cancelled) setOnline(false); })
        .finally(() => { if (!cancelled) timer = setTimeout(tick, 10000); });
    };
    tick();
    return () => { cancelled = true; if (timer) clearTimeout(timer); };
  }, []);

  // backoff re-fetch for KPIs every 30s
  useEffect(() => {
    const t = setInterval(() => api.metrics().then(setMetrics).catch(() => {}), 30000);
    return () => clearInterval(t);
  }, []);

  const View = VIEWS[route];

  return (
    <div className="app">
      <Sidebar active={route} metrics={metrics} online={online} />
      <main className="main">
        <Topbar active={route} />
        <div className="content">
          <section className="views">
            <View />
          </section>
        </div>
      </main>
    </div>
  );
}