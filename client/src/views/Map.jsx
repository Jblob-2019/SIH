import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';
import { MapContainer, TileLayer, CircleMarker, Tooltip, LayersControl, LayerGroup, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

/* Live GIS Map — converted to interactive Leaflet Map */
export default function Map() {
  const lakes   = useApi(api.lakes);
  const sensors = useApi(api.sensors);
  const [spreadOpen, setSpreadOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [tPlus, setTPlus] = useState(0);
  const [scenario, setScenario] = useState('active');

  const lakesList   = (lakes.data   && lakes.data.lakes)     || [];
  const sensorList  = (sensors.data && sensors.data.sensors) || [];

  // spread-simulation clock
  useEffect(() => {
    if (!spreadOpen || paused) return;
    const id = setInterval(() => {
      setTPlus(t => Math.min(720, t + speed * 10));
    }, 1000);
    return () => clearInterval(id);
  }, [spreadOpen, paused, speed]);

  const tStr = `T+${String(Math.floor(tPlus / 60)).padStart(2, '0')}:${String(tPlus % 60).padStart(2, '0')}`;

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Live GIS Map</h1><div className="sub">{lakesList.length} lakes · {sensorList.length} sensors · heatmap + clusters · 14d telemetry overlay</div></div>
        <div className="actions">
          <div className="tag-row">
            <span className="tag active">Health</span>
            <span className="tag">Heatmap</span>
            <span className="tag">Clusters</span>
            <span className="tag">Alerts</span>
            <span className="tag">Forecast</span>
          </div>
          <button className={`btn ${spreadOpen ? 'active' : ''}`} id="spreadToggle" data-action="spread" onClick={() => setSpreadOpen(o => !o)}>⤴ Spread sim</button>
          <button className="btn">Layers ▾</button>
          <button className="btn pri">Filter</button>
        </div>
      </div>

      <div className="map-wrap" style={{ height: 'calc(100vh - 220px)', minHeight: 560 }} id="mapWrap">
        
        <MapContainer center={[21.0, 78.5]} zoom={5} minZoom={4} style={{ height: '100%', width: '100%', zIndex: 1 }} zoomControl={false}>
          <ZoomControl position="bottomright" />
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="OpenStreetMap (Default)">
              <TileLayer
                attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="OpenTopoMap (Terrain)">
              <TileLayer
                attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
                url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
                maxZoom={17}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Esri World Imagery (Ocean)">
              <TileLayer
                attribution='Tiles &copy; Esri'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="CartoDB Minimal (Light)">
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                maxZoom={20}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          {/* Lakes */}
          {lakesList.map(l => {
            const color = l.status === 'crit' ? '#ff4d4f' : l.status === 'warn' ? '#faad14' : '#52c41a';
            return (
              <LayerGroup key={l.id}>
                <CircleMarker center={[l.lat, l.lon]} radius={28} pathOptions={{ fillColor: color, fillOpacity: 0.18, color: 'transparent' }} />
                <CircleMarker center={[l.lat, l.lon]} radius={12} pathOptions={{ fillColor: color, fillOpacity: 0.4, color: 'transparent' }} />
                <CircleMarker center={[l.lat, l.lon]} radius={5} pathOptions={{ fillColor: color, fillOpacity: 1, color }}>
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <strong>{l.name}</strong><br/>Status: {l.status.toUpperCase()}
                  </Tooltip>
                </CircleMarker>
              </LayerGroup>
            );
          })}

          {/* Sensors */}
          {sensorList.map(s => {
            const color = s.signal === 'offline' ? '#ff4d4f' : s.signal === 'weak' ? '#faad14' : '#52c41a';
            return (
              <CircleMarker key={s.id} center={[s.lat, s.lon]} radius={3} pathOptions={{ fillColor: color, fillOpacity: 1, color }}>
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <strong>{s.lakeName} ({s.type})</strong><br/>Signal: {s.signal}
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* overlay panel */}
        <div className="map-overlay-panel" style={{ zIndex: 1000, pointerEvents: 'none' }}>
          <div className="card glass" style={{ padding: 11, pointerEvents: 'auto' }}>
            <div className="card-h" style={{ marginBottom: 6 }}>
              <h3>Selected · Bellandur</h3>
              <span className="right" style={{ color: 'var(--error)' }}>CRITICAL</span>
            </div>
            <div className="stat-line"><span className="lbl">WQI</span><span className="v" style={{ color: 'var(--error)' }}>28.4</span></div>
            <div className="stat-line"><span className="lbl">pH</span><span className="v">5.2</span></div>
            <div className="stat-line"><span className="lbl">DO</span><span className="v">2.1 mg/L</span></div>
            <div className="stat-line"><span className="lbl">Turbidity</span><span className="v">142 NTU</span></div>
            <div className="stat-line"><span className="lbl">Sensors online</span><span className="v">1 / 4</span></div>
            <div className="stat-line"><span className="lbl">Last update</span><span className="v">14:31:42</span></div>
            <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              <button className="btn pri" style={{ flex: 1, justifyContent: 'center' }}>Dispatch</button>
              <button className="btn"     style={{ flex: 1, justifyContent: 'center' }}>Detail</button>
            </div>
          </div>
        </div>

        {/* spread-simulation side panel */}
        <aside className="spread-panel" id="spreadPanel" aria-label="Pollution spread simulation panel" hidden={!spreadOpen} style={{ zIndex: 1000 }}>
          <div className="card glass spread-glass">
            <div className="card-h">
              <h3>Spread Simulation</h3>
              <span className="right"><span id="spreadTplus">{tStr}</span> / T+12:00</span>
            </div>
            <div className="spread-row" style={{ marginBottom: 8 }}>
              <span className="spread-eyebrow">Predictive · βeta</span>
              <span className="spread-meta" id="spreadMeta">Bellandur S-04 · 220 L/min</span>
            </div>
            <div className="spread-controls">
              <button className="iconbtn small" id="spreadSpeedDown" onClick={() => setSpeed(s => Math.max(0.25, s / 2))} aria-label="Slow simulation">−</button>
              <input type="range" id="spreadSlider" min="0" max="120" value={Math.floor(tPlus / 6)} step="1" onChange={e => setTPlus(Number(e.target.value) * 6)} aria-label="Time slider" />
              <button className="iconbtn small" id="spreadSpeedUp"   onClick={() => setSpeed(s => Math.min(8, s * 2))} aria-label="Speed up simulation">+</button>
            </div>
            <div className="spread-ctrl-row" style={{ display: 'flex', gap: 5, marginTop: 8 }}>
              <button className="btn small ghost" id="spreadReplay" onClick={() => setTPlus(0)}>↻ Replay</button>
              <button className="btn small"       id="spreadPause"  onClick={() => setPaused(p => !p)}>{paused ? 'Resume' : 'Pause'}</button>
              <button className="btn small pri"   id="spreadIntervene" style={{ marginLeft: 'auto' }} onClick={() => setScenario(s => s === 'active' ? 'mitigated' : 'active')}>
                {scenario === 'active' ? 'Intervene' : 'Cancel Intervention'}
              </button>
            </div>

            <div className="spread-section-head">Scenario</div>
            <div className={`scenario-row ${scenario === 'baseline' ? 'active' : ''}`} onClick={() => setScenario('baseline')}><span className="sc-ic">●</span><div><div className="sc-nm">Baseline drift</div><div className="sc-sub">no intervention · reach 8 lakes / 12h</div></div></div>
            <div className={`scenario-row ${scenario === 'active' ? 'active' : ''}`} onClick={() => setScenario('active')}><span className="sc-ic crit">●</span><div><div className="sc-nm">Active simulation</div><div className="sc-sub">chemical spill · Bellandur S-04</div></div></div>
            <div className={`scenario-row ${scenario === 'mitigated' ? 'active' : ''}`} onClick={() => setScenario('mitigated')}><span className="sc-ic ok">●</span><div><div className="sc-nm">+ Aerator barge dispatched</div><div className="sc-sub">reach 5 lakes · ETA 38 min</div></div></div>

            <div className="spread-section-head" style={{ marginTop: 12 }}>Time to impact · 12h</div>
            <div className="impact-row crit"><span className="ir-lake">Hussain Sagar</span><span className="ir-bar"><span className="ir-fill" style={{ width: '82%' }} /></span><span className="ir-time">1h 48m</span></div>
            <div className="impact-row crit"><span className="ir-lake">Surajkund</span><span className="ir-bar"><span className="ir-fill" style={{ width: '64%' }} /></span><span className="ir-time">2h 22m</span></div>
            <div className="impact-row warn"><span className="ir-lake">Vembanad N</span><span className="ir-bar"><span className="ir-fill warn" style={{ width: '48%' }} /></span><span className="ir-time">5h 04m</span></div>
            <div className="impact-row warn"><span className="ir-lake">Chilika</span><span className="ir-bar"><span className="ir-fill warn" style={{ width: '34%' }} /></span><span className="ir-time">7h 12m</span></div>
            <div className="impact-row"><span className="ir-lake">Ashtamudi</span><span className="ir-bar"><span className="ir-fill safe" style={{ width: '18%' }} /></span><span className="ir-time">9h 50m</span></div>
            <div className="impact-row"><span className="ir-lake">Wular</span><span className="ir-bar"><span className="ir-fill safe" style={{ width: '6%' }} /></span><span className="ir-time">11h 30m</span></div>

            <div className="spread-stats">
              <div className="stat-line"><span className="lbl">Watershed affected</span><span className="v">38.4 km²</span></div>
              <div className="stat-line"><span className="lbl">Population in zone</span><span className="v">412k</span></div>
              <div className="stat-line"><span className="lbl">Confidence (95% CI)</span><span className="v">±8.3%</span></div>
              <div className="stat-line"><span className="lbl">Est. economic impact</span><span className="v" style={{ color: 'var(--tertiary-container)' }}>₹ 18.6 Cr</span></div>
            </div>
          </div>
        </aside>

        <div className="map-legend" style={{ zIndex: 1000, bottom: 44 }}>
          <div className="legend-item"><span className="legend-pip" style={{ background: 'var(--secondary)' }} />Healthy</div>
          <div className="legend-item"><span className="legend-pip" style={{ background: '#facc15' }} />Moderate</div>
          <div className="legend-item"><span className="legend-pip" style={{ background: 'var(--tertiary-container)' }} />At Risk</div>
          <div className="legend-item"><span className="legend-pip" style={{ background: 'var(--error)' }} />Critical</div>
          <div className="legend-item"><span className="legend-pip" style={{ background: 'var(--outline)' }} />Offline</div>
        </div>

        <div className="map-stats" style={{ zIndex: 1000, bottom: 44 }}>
          <span>VISIBLE · {lakesList.length}</span><span>·</span>
          <span>LIVE MAP</span><span>·</span>
          <span style={{ color: 'var(--surface-tint)' }}>WGS-84</span>
        </div>
      </div>
    </div>
  );
}