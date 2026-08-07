import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      onLogin({ username: 'admin', role: 'admin' });
    } else if (username === 'city1' && password === 'city123') {
      onLogin({ username: 'city1', role: 'citizen' });
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg, #0b1120)', color: 'var(--text, #f8fafc)', fontFamily: 'var(--font, sans-serif)' }}>
      <div className="card glass" style={{ padding: '40px', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, background: 'var(--primary, #0ea5e9)', color: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 'bold', margin: '0 auto 16px' }}>A</div>
          <h2 style={{ margin: 0, fontSize: 24 }}>AquaMind Auth</h2>
          <p style={{ margin: '8px 0 0', color: 'var(--text-muted, #94a3b8)' }}>Sign in to continue</p>
        </div>

        {error && <div style={{ padding: 12, background: 'rgba(255, 77, 79, 0.1)', border: '1px solid var(--error, #ff4d4f)', color: 'var(--error, #ff4d4f)', borderRadius: 6, textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border, #334155)', background: 'var(--input-bg, #1e293b)', color: '#fff', boxSizing: 'border-box' }} 
              autoFocus 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid var(--border, #334155)', background: 'var(--input-bg, #1e293b)', color: '#fff', boxSizing: 'border-box' }} 
            />
          </div>
          <button type="submit" className="btn pri" style={{ padding: '12px', marginTop: '8px', fontSize: 16, justifyContent: 'center' }}>Sign In</button>
        </form>

        <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted, #94a3b8)' }}>
          <div>Admin: admin / admin123</div>
          <div>Citizen: city1 / city123</div>
        </div>
      </div>
    </div>
  );
}
