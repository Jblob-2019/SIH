import React from 'react';

const species = [
  { sp: 'catla',       name: 'Catla catla',         sub: 'Indian carp · planktivore',     pct: 88, fill: 'var(--error)',                  pill: 'crit', pl: 'crit' },
  { sp: 'rohu',        name: 'Labeo rohita',        sub: 'Rohu · column-feeder',          pct: 74, fill: 'var(--error)',                  pill: 'crit', pl: 'crit' },
  { sp: 'hilsa',       name: 'Tenualosa ilisha',    sub: 'Hilsa · anadromous',            pct: 66, fill: 'var(--tertiary-container)',     pill: 'warn', pl: 'watch' },
  { sp: 'puntius',     name: 'Puntius sarana',      sub: 'Olive barb · benthopelagic',    pct: 58, fill: 'var(--tertiary-container)',     pill: 'warn', pl: 'watch' },
  { sp: 'channa',      name: 'Channa striata',      sub: 'Striped snakehead · predator',  pct: 42, fill: 'var(--tertiary-container)',     pill: 'warn', pl: 'watch' },
  { sp: 'eichhornia',  name: 'Eichhornia crassipes', sub: 'Water hyacinth · invasive',     pct: 31, fill: 'var(--secondary)',             pill: 'ok',   pl: 'stable' },
  { sp: 'vallisneria', name: 'Vallisneria spiralis', sub: 'Eelgrass · submerged',          pct: 28, fill: 'var(--secondary)',             pill: 'ok',   pl: 'stable' },
  { sp: 'najas',       name: 'Najas indica',         sub: 'Water-nymph · submerged',       pct: 18, fill: 'var(--secondary)',             pill: 'ok',   pl: 'stable' },
  { sp: 'daphnia',     name: 'Daphnia magna',        sub: 'Water flea · zooplankton',      pct: 12, fill: 'var(--surface-tint)',          pill: 'ok',   pl: 'stable' }
];

const fishIcon = (() => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M3 12c2-3 5-4 9-4s7 1 9 4c-2 3-5 4-9 4s-7-1-9-4z" />
    <path d="M3 12l-2-1.5M3 12l-2 1.5" />
    <circle cx="9" cy="12" r=".7" fill="currentColor" />
  </svg>
));

const botanicalIcon = (() => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M12 4v16M8 8c-2 2-2 4 0 6M16 8c2 2 2 4 0 6M8 16c-2 0-3 1-3 2M16 16c2 0 3 1 3 2" />
  </svg>
));

const gauges = [
  { v: 65, l: 'DO balance',       col: 'var(--secondary)',             off: 44 },
  { v: 70, l: 'Turbidity',        col: 'var(--tertiary-container)',    off: 38 },
  { v: 35, l: 'Phyto diversity',  col: 'var(--error)',                 off: 82 },
  { v: 60, l: 'Benthic cover',    col: 'var(--secondary)',             off: 50 },
  { v: 74, l: 'Microbe activity', col: 'var(--tertiary-container)',    off: 32 },
  { v: 50, l: 'Spawn viability',  col: 'var(--error)',                 off: 63 }
];

const ecoActions = [
  { tone: 'crit', tag: '↑ mortality', txt: 'Aerate Bellandur — DO drop projected in 36h',            meta: 'ETA 2h · Prevents 1,200kg loss · Cost ₹ 0.4L' },
  { tone: 'crit', tag: '↑ mortality', txt: 'Relocate Hilsa fingerlings from Surajkund',              meta: 'ETA 8h · Saves ~600kg juvenile biomass' },
  { tone: 'warn', tag: 'invasive',    txt: 'Schedule hyacinth removal at Loktak · 0.4 km²',         meta: 'ETA 5d · Restores 12% benthic cover' },
  { tone: 'warn', tag: 'spawn',       txt: 'Pause dredging at Bhojtal during Cyprinus spawn',       meta: 'Jul 28–Aug 12 · +18% juvenile recruitment' },
  { tone: 'ok',   tag: 'recover',     txt: 'Continue Vembanad seagrass restoration',                 meta: 'On track · +0.6 km² cover in 14d' }
];

export default function Biodiversity() {
  return (
    <div className="view active">
      <div className="section-h">
        <div>
          <div className="eyebrow" style={{ color: 'var(--secondary)' }}>AquaMind · ecological models · v4.2</div>
          <h1>Biodiversity Prediction</h1>
          <div className="sub">12 lakes · 9 species classes · microbe model + fish mortality projection · forecast horizon 14d</div>
        </div>
        <div className="actions">
          <select className="btn ghost" aria-label="Filter by lake" style={{ paddingRight: 24 }}>
            <option>All lakes</option>
            <option>Bellandur</option>
            <option>Chilika</option>
            <option>Loktak</option>
            <option>Vembanad</option>
            <option>Dal</option>
            <option>Hussain Sagar</option>
            <option>Pangong</option>
          </select>
          <button className="btn ghost">14d horizon</button>
          <button className="btn">Download report</button>
          <button className="btn pri">Run new prediction</button>
        </div>
      </div>

      <div className="opt-kpi">
        <div className="ok-tile bio-hero">
          <div className="eyebrow" style={{ color: 'var(--tertiary-container)' }}>Ecosystem health index</div>
          <div className="ok-num">62<span className="unit">/ 100</span></div>
          <div className="ok-delta up">↑ 4 since Jun · recovering</div>
          <div className="bio-spark">
            <svg viewBox="0 0 240 40" width="100%" height="40" aria-hidden="true">
              <defs>
                <linearGradient id="bioGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--tertiary-container)" stopOpacity=".45" />
                  <stop offset="1" stopColor="var(--tertiary-container)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,28 C20,26 35,30 50,24 C70,16 90,22 110,18 C130,12 150,16 170,10 C190,6 210,12 240,4" fill="none" stroke="var(--tertiary-container)" strokeWidth="1.5" />
              <path d="M0,28 C20,26 35,30 50,24 C70,16 90,22 110,18 C130,12 150,16 170,10 C190,6 210,12 240,4 L240,40 L0,40 Z" fill="url(#bioGrad)" />
            </svg>
          </div>
        </div>
        <div className="ok-tile">
          <div className="eyebrow" style={{ color: 'var(--error)' }}>Projected fish mortality</div>
          <div className="ok-num">3,840<span className="unit">kg · 14d</span></div>
          <div className="ok-delta down">↑ 22% vs last 14d · driven by Bellandur + Surajkund</div>
        </div>
        <div className="ok-tile">
          <div className="eyebrow" style={{ color: 'var(--secondary)' }}>Species at risk</div>
          <div className="ok-num">7<span className="unit">of 23</span></div>
          <div className="ok-delta up">3 of those recovering</div>
        </div>
        <div className="ok-tile">
          <div className="eyebrow">Microbe activity</div>
          <div className="ok-num">0.84<span className="unit">μg·L⁻¹</span></div>
          <div className="ok-delta">stable · within tolerance</div>
        </div>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1.05fr 1fr' }}>
        <div className="card glass">
          <div className="card-h">
            <h3>Species risk · 9 classes</h3>
            <div className="right">
              <span className="pill crit"><span className="pip" />critical</span>{' '}
              <span className="pill warn"><span className="pip" />watch</span>
            </div>
          </div>
          <div className="species-list">
            {species.map(s => (
              <div className="sp-row" key={s.sp}>
                <div className="sp-ico">{['eichhornia', 'vallisneria', 'najas'].includes(s.sp) ? botanicalIcon : fishIcon}</div>
                <div className="sp-meta">
                  <div className="sp-name">{s.name}</div>
                  <div className="sp-sub">{s.sub}</div>
                </div>
                <div className="sp-bar">
                  <div className="sp-fill" style={{ width: `${s.pct}%`, background: s.fill }} />
                </div>
                <div className="sp-rs"><span className={`pill ${s.pill}`}><span className="pip" />{s.pl}</span></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card glass">
          <div className="card-h">
            <h3>Ecosystem stability gauges</h3>
            <div className="right">12 lakes aggregated</div>
          </div>
          <div className="gauge-grid">
            {gauges.map(g => (
              <div className="g-cell" key={g.l}>
                <svg viewBox="0 0 100 60" className="gauge">
                  <path d="M10 55 A 40 40 0 0 1 90 55" fill="none" stroke="var(--outline-variant)" strokeWidth="6" strokeLinecap="round" />
                  <path d="M10 55 A 40 40 0 0 1 90 55" fill="none" stroke={g.col} strokeWidth="6" strokeLinecap="round" strokeDasharray="126 126" pathLength="126" strokeDashoffset={g.off} />
                  <text x="50" y="50" textAnchor="middle" className="g-v">{g.v}%</text>
                  <text x="50" y="62" textAnchor="middle" className="g-l">{g.l}</text>
                </svg>
              </div>
            ))}
          </div>
          <div className="gauge-foot">
            <div><div className="eyebrow">Pollution tolerance</div><div className="gf-val" style={{ color: 'var(--secondary)' }}>moderate</div></div>
            <div><div className="eyebrow">Eutrophication</div><div className="gf-val" style={{ color: 'var(--tertiary-container)' }}>high · 4 lakes</div></div>
            <div><div className="eyebrow">Hypoxia risk</div><div className="gf-val" style={{ color: 'var(--error)' }}>3 lakes · 48h</div></div>
          </div>
        </div>
      </div>

      <div className="two-col" style={{ gridTemplateColumns: '1.4fr 1fr', marginTop: 12 }}>
        <div className="card glass">
          <div className="card-h"><h3>Fish mortality projection · 14-day</h3><div className="right">model v4.2 · 4.2k samples</div></div>
          <svg viewBox="0 0 720 220" width="100%" height="220" aria-label="Mortality projection over 14 days">
            <defs>
              <linearGradient id="mortG" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[55, 95, 135, 175].map(y => (
              <line key={y} x1="20" x2="700" y1={y} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 4" />
            ))}
            <polyline fill="url(#mortG)" stroke="none" points="20,200 80,180 160,160 240,130 320,110 400,90 480,78 560,60 640,52 700,30 700,220 20,220" />
            <polyline fill="none" stroke="#ffb4ab" strokeWidth="1.6" points="20,200 80,180 160,160 240,130 320,110 400,90 480,78 560,60 640,52 700,30" />
            {[20, 80, 160, 240, 320, 400, 480, 560, 640, 700].map((x, i) => (
              <circle key={i} cx={x} cy={[
                200, 180, 160, 130, 110, 90, 78, 60, 52, 30
              ][i]} r="3" fill="#ffb4ab" />
            ))}
          </svg>
          <div className="mortality-axis">
            <span>06 Aug</span><span>09 Aug</span><span>12 Aug</span><span>15 Aug</span><span>18 Aug</span><span>20 Aug</span>
          </div>
        </div>
        <div className="card glass">
          <div className="card-h"><h3>AI ecological actions</h3><div className="right">5 recommended</div></div>
          {ecoActions.map((a, i) => (
            <div className="bio-rec" key={i}>
              <div className={'bio-prio ' + a.tone}>{a.tag}</div>
              <div>
                <div className="bio-txt">{a.txt}</div>
                <div className="bio-meta">{a.meta}</div>
              </div>
              <button className="btn small">Apply</button>
            </div>
          ))}
        </div>
      </div>

      <div className="card glass" style={{ marginTop: 12 }}>
        <div className="card-h">
          <h3>Per-lake biodiversity index</h3>
          <div className="right">12 of 12 lakes · sorted by risk</div>
        </div>
        <div className="tbl-wrap" style={{ border: 0, background: 'transparent' }}>
          <table className="tbl">
            <thead><tr>
              <th>Lake</th><th>Region</th><th>Bio Index</th><th>WQI</th>
              <th>Species observed</th><th>Mortality 14d</th><th>Trend</th><th>Risk</th><th>Recommendation</th>
            </tr></thead>
            <tbody>
              <tr>
                <td className="label">Bellandur</td><td>Karnataka</td>
                <td className="num">28</td><td className="num">31</td>
                <td>11 / 23</td><td className="num" style={{ color: 'var(--error)' }}>1,420 kg</td>
                <td className="num" style={{ color: 'var(--error)' }}>↓ 12</td>
                <td><span className="pill crit"><span className="pip" />crit</span></td>
                <td className="label">Aerate · relocate Hilsa</td>
              </tr>
              {['Surajkund', 'Hussain Sagar', 'Nakki', 'Vembanad', 'Dal', 'Loktak', 'Bhojtal', 'Chilika', 'Pangong', 'Wular', 'Sambhar'].map((n, i) => {
                const bio = 40 + i * 4;
                const wqi = 50 + i * 4;
                const mort = 1200 - i * 80;
                const sp = `${10 + (i % 4)} / 23`;
                return (
                  <tr key={n}>
                    <td className="label">{n}</td>
                    <td>{['Haryana', 'Telangana', 'Rajasthan', 'Kerala', 'J&K', 'Manipur', 'MP', 'Odisha', 'Ladakh', 'J&K', 'Rajasthan'][i]}</td>
                    <td className="num">{bio}</td>
                    <td className="num">{wqi}</td>
                    <td>{sp}</td>
                    <td className="num" style={{ color: mort > 600 ? 'var(--error)' : '' }}>{mort} kg</td>
                    <td className="num" style={{ color: i < 2 ? 'var(--error)' : 'var(--secondary)' }}>{i < 2 ? '↓' : '▲'} {Math.abs(i - 2) + 1}</td>
                    <td>
                      <span className={`pill ${i < 2 ? 'crit' : i < 4 ? 'warn' : 'ok'}`}>
                        <span className="pip" />{i < 2 ? 'crit' : i < 4 ? 'watch' : 'stable'}
                      </span>
                    </td>
                    <td className="label">{['Aerate · relocate Hilsa', 'Sample outflows', 'Bloom treatment', 'Seagrass restoration', 'Maintain', 'Restore benthic', 'Schedule dredge', 'Replace sensor', 'Survey-only', 'Monitor', 'PH stabilize'][i]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}