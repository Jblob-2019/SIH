import React, { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { useApi } from '../lib/hooks.js';

export default function CitizenDashboard() {
  const { data: metrics, loading } = useApi(api.metrics);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cardStyle = (delay) => ({
    padding: '24px', 
    textDecoration: 'none', 
    color: 'inherit', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '12px', 
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
    cursor: 'pointer',
    opacity: mounted ? 1 : 0,
    transform: mounted ? 'translateY(0)' : 'translateY(20px)',
    transitionDelay: delay
  });

  const hoverStyle = (e, hover) => {
    e.currentTarget.style.transform = hover ? 'translateY(-6px) scale(1.02)' : 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = hover ? '0 12px 32px rgba(0,0,0,0.4)' : '';
  };

  return (
    <div className="view active" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      <div className="section-h" style={{ marginBottom: '40px', opacity: mounted ? 1 : 0, transition: 'opacity 0.6s' }}>
        <div>
          <h1 style={{ fontSize: '36px', background: 'linear-gradient(to right, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Citizen Portal</h1>
          <div className="sub" style={{ fontSize: '18px', marginTop: '8px' }}>Welcome to the AquaMind Public Intelligence Dashboard</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <a href="#map" className="card glass" style={cardStyle('0.1s')} onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '40px' }}>🗺️</div>
            {loading ? <span className="pill">Loading...</span> : <span className="pill ok">● {metrics?.sensorsOnline || 0} Sensors Live</span>}
          </div>
          <h3 style={{ fontSize: '20px', margin: '8px 0 0' }}>Live Map</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>View real-time water quality data, pollution dispersion simulations, and sensor statuses across all monitored lakes.</p>
          <div style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--primary)', fontWeight: '500', fontSize: '14px' }}>Open Map →</div>
        </a>
        
        <a href="#citizen" className="card glass" style={cardStyle('0.2s')} onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '40px' }}>📣</div>
            {loading ? <span className="pill">Loading...</span> : <span className="pill info">{metrics?.openIncidents || 0} Active Reports</span>}
          </div>
          <h3 style={{ fontSize: '20px', margin: '8px 0 0' }}>Citizen Report</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Report local water issues, illegal dumping, or wildlife anomalies directly to the hydraulic command center.</p>
          <div style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--primary)', fontWeight: '500', fontSize: '14px' }}>File a Report →</div>
        </a>

        <a href="#lakes" className="card glass" style={cardStyle('0.3s')} onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '40px' }}>💧</div>
            {loading ? <span className="pill">Loading...</span> : <span className="pill ok">{metrics?.totalLakes || 0} Lakes Monitored</span>}
          </div>
          <h3 style={{ fontSize: '20px', margin: '8px 0 0' }}>Lake Health & Ratings</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Browse detailed health scores, historical data, and overall water quality index ratings for specific water bodies.</p>
          <div style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--primary)', fontWeight: '500', fontSize: '14px' }}>View Ratings →</div>
        </a>

        <a href="#biodiversity" className="card glass" style={cardStyle('0.4s')} onMouseEnter={e => hoverStyle(e, true)} onMouseLeave={e => hoverStyle(e, false)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '40px' }}>🐟</div>
            {loading ? <span className="pill">Loading...</span> : <span className="pill warn">{metrics?.alertsToday || 0} Eco Alerts</span>}
          </div>
          <h3 style={{ fontSize: '20px', margin: '8px 0 0' }}>Biodiversity Prediction</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>Explore AI-driven predictions on local aquatic life health, fish populations, and ecosystem stability.</p>
          <div style={{ marginTop: 'auto', paddingTop: '16px', color: 'var(--primary)', fontWeight: '500', fontSize: '14px' }}>View Predictions →</div>
        </a>
      </div>
    </div>
  );
}
