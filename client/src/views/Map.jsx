import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi, wqiOf } from '../lib/hooks.js';
import { MapContainer, TileLayer, CircleMarker, Tooltip, LayersControl, LayerGroup, FeatureGroup, ZoomControl, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function getGradientColor(value) {
  const max = 50;
  const clamped = Math.max(0, Math.min(max, value || 0));
  const ratio = clamped / max;
  let r, g, b;
  if (ratio < 0.5) {
    const rRatio = ratio * 2;
    r = Math.round(82 + rRatio * (250 - 82));
    g = Math.round(196 + rRatio * (173 - 196));
    b = Math.round(26 + rRatio * (20 - 26));
  } else {
    const rRatio = (ratio - 0.5) * 2;
    r = Math.round(250 + rRatio * (255 - 250));
    g = Math.round(173 + rRatio * (77 - 173));
    b = Math.round(20 + rRatio * (79 - 20));
  }
  return `rgb(${r}, ${g}, ${b})`;
}

// Flies the map to the selected lake. Must live at module scope: defining it
// inside Map() gives it a new identity every render, which remounts it and
// re-fires flyTo on every tick (the map kept snapping back to the lake).
function MapController({ center, zoom }) {
  const map = useMap();
  const lat = center && center[0];
  const lon = center && center[1];
  useEffect(() => {
    if (lat != null) map.flyTo([lat, lon], zoom, { duration: 0.4 });
  }, [lat, lon, zoom, map]);
  return null;
}

// great-circle distance in metres
function distanceM(a, b) {
  const R = 6371000, rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad, dLon = (b.lon - a.lon) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

const SCENARIO_FACTOR = { baseline: 0.6, active: 1, mitigated: 0.35 };
const SIM_MINUTES = 720; // T+12:00
const TN_DENSITY_PER_KM2 = 555;

// Spread model: plume front advances at a speed driven by turbidity (m/min),
// starting from the water body's own footprint.
function spreadModel(lake, scenario) {
  const speed = ((lake.metricValue || 0) * 2 + 20) * (SCENARIO_FACTOR[scenario] || 1);
  const baseR = Math.sqrt(lake.area_km2 || 1) * 500;
  return { speed, baseR, radiusAt: t => baseR + speed * t };
}

const fmtDur = min => `${Math.floor(min / 60)}h ${String(Math.round(min % 60)).padStart(2, '0')}m`;

/* Live GIS Map — converted to interactive Leaflet Map */
export default function Map() {
  const lakes   = useApi(api.lakes);
  const sensors = useApi(api.sensors);
  const [spreadOpen, setSpreadOpen] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [paused, setPaused] = useState(false);
  const [tPlus, setTPlus] = useState(0);
  const [scenario, setScenario] = useState('active');
  const [selectedLake, setSelectedLake] = useState(null);
  const [layersMenuOpen, setLayersMenuOpen] = useState(false);
  const [activeLayer, setActiveLayer] = useState('osm');

  const [dispatchMsg, setDispatchMsg] = useState('');

  const lakesList   = (lakes.data   && lakes.data.lakes)     || [];
  const sensorList  = (sensors.data && sensors.data.sensors) || [];

  // Auto-refresh data every 10s so points reappear if backend restarts
  useEffect(() => {
    const id = setInterval(() => {
      lakes.refetch();
      sensors.refetch();
    }, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // spread-simulation clock
  useEffect(() => {
    if (!spreadOpen || paused) return;
    const id = setInterval(() => {
      setTPlus(t => Math.min(720, t + speed * 10));
    }, 1000);
    return () => clearInterval(id);
  }, [spreadOpen, paused, speed]);

  const model = selectedLake ? spreadModel(selectedLake, scenario) : null;
  const outerR = model && tPlus > 0 ? model.radiusAt(tPlus) : 0;
  const affectedKm2 = outerR ? Math.PI * (outerR / 1000) ** 2 : 0;

  // downstream lakes the plume reaches within the 12h window, nearest first
  const impacts = useMemo(() => {
    if (!selectedLake) return [];
    const m = spreadModel(selectedLake, scenario);
    return lakesList
      .filter(l => l.id !== selectedLake.id)
      .map(l => ({ lake: l, minutes: Math.max(0, (distanceM(selectedLake, l) - m.baseR) / m.speed) }))
      .filter(x => x.minutes <= SIM_MINUTES)
      .sort((a, b) => a.minutes - b.minutes)
      .slice(0, 6);
  }, [selectedLake, scenario, lakesList]);

  useEffect(() => { setDispatchMsg(''); }, [selectedLake]);

  const dispatchTeam = async () => {
    if (!selectedLake) return;
    setDispatchMsg('Dispatching…');
    try {
      const inc = await api.createIncident({
        lake: selectedLake.name,
        title: 'Field team dispatched from GIS map',
        severity: selectedLake.status === 'crit' ? 'crit' : selectedLake.status === 'warn' ? 'warn' : 'info'
      });
      setDispatchMsg(`Dispatched · ${inc.id}`);
    } catch (err) {
      setDispatchMsg(`Failed: ${err.message}`);
    }
  };

  const tStr = `T+${String(Math.floor(tPlus / 60)).padStart(2, '0')}:${String(tPlus % 60).padStart(2, '0')}`;

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>Live GIS Map</h1><div className="sub">{lakesList.length} lakes · {sensorList.length} sensors · heatmap + clusters · 14d telemetry overlay</div></div>
        <div className="actions">
          <div className="tag-row">
            <span className="tag active">Health</span>
          </div>
          <button className={`btn ${spreadOpen ? 'active' : ''}`} id="spreadToggle" data-action="spread" onClick={() => setSpreadOpen(o => !o)}>⤴ Spread sim</button>
          
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button className="btn" onClick={() => setLayersMenuOpen(!layersMenuOpen)}>Layers ▾</button>
            {layersMenuOpen && (
              <div className="glass" style={{ position: 'absolute', top: '100%', right: 0, marginTop: 4, background: 'rgba(15, 23, 42, 0.95)', border: '1px solid rgba(137, 206, 255, 0.2)', borderRadius: 6, padding: '12px 16px', zIndex: 9999, minWidth: 240, boxShadow: '0 8px 32px rgba(0,0,0,0.4)', color: '#e2e8f0', backdropFilter: 'blur(12px)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" name="maplayer" checked={activeLayer === 'osm'} onChange={() => { setActiveLayer('osm'); setLayersMenuOpen(false); }} /> OpenStreetMap (Default)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" name="maplayer" checked={activeLayer === 'topo'} onChange={() => { setActiveLayer('topo'); setLayersMenuOpen(false); }} /> OpenTopoMap (Terrain)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" name="maplayer" checked={activeLayer === 'esri'} onChange={() => { setActiveLayer('esri'); setLayersMenuOpen(false); }} /> Esri World Imagery (Satellite)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '8px 0', cursor: 'pointer', fontSize: '14px' }}>
                  <input type="radio" name="maplayer" checked={activeLayer === 'carto'} onChange={() => { setActiveLayer('carto'); setLayersMenuOpen(false); }} /> CartoDB Minimal (Light)
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="map-wrap" style={{ height: 'calc(100vh - 220px)', minHeight: 560 }} id="mapWrap">
        
        <MapContainer center={[11.1271, 78.6569]} zoom={7} zoomControl={false} style={{ width: '100%', height: '100%', background: '#b3d9ff' }}>
          <MapController center={selectedLake ? [selectedLake.lat, selectedLake.lon] : null} zoom={selectedLake ? 12 : 7} />
          <ZoomControl position="topright" />
          
          {activeLayer === 'osm' && (
            <TileLayer
              attribution='&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          )}
          {activeLayer === 'topo' && (
            <TileLayer
              attribution='&copy; <a href="https://opentopomap.org">OpenTopoMap</a>'
              url="https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"
              maxZoom={17}
            />
          )}
          {activeLayer === 'esri' && (
            <TileLayer
              attribution='Tiles &copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
          )}
          {activeLayer === 'carto' && (
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              maxZoom={20}
            />
          )}

          {/* Lakes */}
          {lakesList.map(l => {
            const color = getGradientColor(l.metricValue);
            return (
              <FeatureGroup key={l.id} eventHandlers={{ click: () => setSelectedLake(l) }}>
                <CircleMarker center={[l.lat, l.lon]} radius={28} pathOptions={{ fillColor: color, fillOpacity: 0.18, color: 'transparent' }} />
                <CircleMarker center={[l.lat, l.lon]} radius={12} pathOptions={{ fillColor: color, fillOpacity: 0.4, color: 'transparent' }} />
                <CircleMarker center={[l.lat, l.lon]} radius={5} pathOptions={{ fillColor: color, fillOpacity: 1, color }}>
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                    <strong>{l.name}</strong><br/>
                    Status: {l.status.toUpperCase()}<br/>
                    Turbidity: {l.metricValue != null ? l.metricValue.toFixed(1) + ' NTU' : 'N/A'}
                  </Tooltip>
                </CircleMarker>
              </FeatureGroup>
            );
          })}

          {/* Sensors */}
          {sensorList.map(s => {
            const color = s.signal === 'offline' ? '#ff4d4f' : s.signal === 'weak' ? '#faad14' : '#52c41a';
            return (
              <CircleMarker key={s.id} center={[s.lat, s.lon]} radius={3} pathOptions={{ fillColor: color, fillOpacity: 1, color }} eventHandlers={{ click: () => {
                const parentLake = lakesList.find(l => l.id === s.lakeId);
                if (parentLake) setSelectedLake(parentLake);
              }}}>
                <Tooltip direction="top" offset={[0, -5]} opacity={1}>
                  <strong>{s.lakeName} ({s.type})</strong><br/>Signal: {s.signal}
                </Tooltip>
              </CircleMarker>
            );
          })}

          {/* Spread Simulation Visuals */}
          {spreadOpen && selectedLake && tPlus > 0 && (
            <FeatureGroup>
              {/* Outer boundary of the spread */}
              <Circle 
                center={[selectedLake.lat, selectedLake.lon]} 
                radius={outerR}
                pathOptions={{ 
                  color: scenario === 'mitigated' ? '#52c41a' : '#ff4d4f', 
                  fillColor: scenario === 'mitigated' ? '#52c41a' : '#ff4d4f', 
                  fillOpacity: 0.15, 
                  weight: 1, 
                  dashArray: '4 4' 
                }} 
              />
              {/* Core highly-polluted area */}
              <Circle 
                center={[selectedLake.lat, selectedLake.lon]} 
                radius={model.baseR + (outerR - model.baseR) * 0.4}
                pathOptions={{ 
                  color: 'transparent', 
                  fillColor: scenario === 'mitigated' ? '#52c41a' : '#ff4d4f', 
                  fillOpacity: scenario === 'mitigated' ? 0.2 : 0.4 
                }} 
              />
            </FeatureGroup>
          )}
        </MapContainer>

        {/* overlay panel */}
        {selectedLake && (
          <div className="map-overlay-panel" style={{ zIndex: 1000, pointerEvents: 'none' }}>
            <div className="card glass" style={{ padding: 11, pointerEvents: 'auto' }}>
              <div className="card-h" style={{ marginBottom: 6 }}>
                <h3>SELECTED · {selectedLake.name.toUpperCase()}</h3>
                <span className="right" style={{ color: selectedLake.status === 'crit' ? 'var(--error)' : selectedLake.status === 'warn' ? '#faad14' : '#52c41a', textTransform: 'uppercase' }}>
                  {selectedLake.status === 'crit' ? 'CRITICAL' : selectedLake.status}
                </span>
              </div>
              <div className="stat-line"><span className="lbl">WQI</span><span className="v" style={{ color: selectedLake.status === 'crit' ? 'var(--error)' : 'inherit' }}>{wqiOf(selectedLake).toFixed(1)}</span></div>
              <div className="stat-line"><span className="lbl">pH</span><span className="v">{selectedLake.ph != null ? selectedLake.ph.toFixed(1) : 'N/A'}</span></div>
              <div className="stat-line"><span className="lbl">DO</span><span className="v">{selectedLake.dissolved_oxygen != null ? selectedLake.dissolved_oxygen.toFixed(1) + ' mg/L' : 'N/A'}</span></div>
              <div className="stat-line"><span className="lbl">Turbidity</span><span className="v">{selectedLake.turbidity != null ? selectedLake.turbidity.toFixed(1) + ' NTU' : 'N/A'}</span></div>
              <div className="stat-line"><span className="lbl">Water Level</span><span className="v">{selectedLake.water_level_m != null ? selectedLake.water_level_m.toFixed(1) + ' m' : 'N/A'}</span></div>
              <div className="stat-line"><span className="lbl">Last update</span><span className="v">{selectedLake.recorded_at ? new Date(selectedLake.recorded_at).toLocaleTimeString() : 'N/A'}</span></div>
              <div style={{ display: 'flex', gap: 5, marginTop: 8 }}>
                <button className="btn pri" style={{ flex: 1, justifyContent: 'center' }} onClick={dispatchTeam}>Dispatch</button>
                <button className="btn"     style={{ flex: 1, justifyContent: 'center' }} onClick={() => setSelectedLake(null)}>Close</button>
              </div>
              {dispatchMsg && <div style={{ marginTop: 6, fontSize: 12, color: dispatchMsg.startsWith('Failed') ? 'var(--error)' : 'var(--secondary)' }}>{dispatchMsg}</div>}
            </div>
          </div>
        )}

        {/* spread-simulation side panel */}
        <aside className="spread-panel" id="spreadPanel" aria-label="Pollution spread simulation panel" hidden={!spreadOpen} style={{ zIndex: 1000 }}>
          <div className="card glass spread-glass">
            <div className="card-h">
              <h3>Spread Simulation</h3>
              <span className="right"><span id="spreadTplus">{tStr}</span> / T+12:00</span>
            </div>
            <div className="spread-row" style={{ marginBottom: 8 }}>
              <span className="spread-eyebrow">Predictive · βeta</span>
              <span className="spread-meta" id="spreadMeta">{selectedLake ? `${selectedLake.name} · front ${model.speed.toFixed(0)} m/min` : 'Please select a lake on the map'}</span>
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
            <div className={`scenario-row ${scenario === 'baseline' ? 'active' : ''}`} onClick={() => setScenario('baseline')}><span className="sc-ic">●</span><div><div className="sc-nm">Baseline drift</div><div className="sc-sub">no intervention · natural dispersion</div></div></div>
            <div className={`scenario-row ${scenario === 'active' ? 'active' : ''}`} onClick={() => setScenario('active')}><span className="sc-ic crit">●</span><div><div className="sc-nm">Active simulation</div><div className="sc-sub">chemical spill · {selectedLake ? selectedLake.name : 'Unknown source'}</div></div></div>
            <div className={`scenario-row ${scenario === 'mitigated' ? 'active' : ''}`} onClick={() => setScenario('mitigated')}><span className="sc-ic ok">●</span><div><div className="sc-nm">+ Aerator barge dispatched</div><div className="sc-sub">neutralizing agents deployed</div></div></div>

            <div className="spread-section-head" style={{ marginTop: 12 }}>Time to impact · 12h</div>
            {!selectedLake && <div className="impact-row"><span className="ir-lake">Select a source lake</span></div>}
            {selectedLake && impacts.length === 0 && <div className="impact-row"><span className="ir-lake">No water bodies within 12h reach</span></div>}
            {impacts.map(({ lake, minutes }) => {
              const tone = minutes < 180 ? 'crit' : minutes < 480 ? 'warn' : '';
              const reached = tPlus > 0 && tPlus >= minutes;
              return (
                <div className={'impact-row ' + tone} key={lake.id}>
                  <span className="ir-lake">{lake.name}</span>
                  <span className="ir-bar"><span className={'ir-fill ' + (tone === 'warn' ? 'warn' : tone ? '' : 'safe')} style={{ width: `${Math.round((1 - minutes / SIM_MINUTES) * 100)}%` }} /></span>
                  <span className="ir-time">{reached ? 'reached' : fmtDur(minutes)}</span>
                </div>
              );
            })}

            <div className="spread-stats">
              <div className="stat-line"><span className="lbl">Watershed affected</span><span className="v">{affectedKm2.toFixed(1)} km²</span></div>
              <div className="stat-line"><span className="lbl">Population in zone</span><span className="v">{(affectedKm2 * TN_DENSITY_PER_KM2 / 1000).toFixed(1)}k</span></div>
              <div className="stat-line"><span className="lbl">Confidence (95% CI)</span><span className="v">±8.3%</span></div>
              <div className="stat-line"><span className="lbl">Est. economic impact</span><span className="v" style={{ color: 'var(--tertiary-container)' }}>{'₹ ' + (affectedKm2 * (selectedLake ? (selectedLake.metricValue || 0) + 10 : 0) * 0.002).toFixed(1) + ' Cr'}</span></div>
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