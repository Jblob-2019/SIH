import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const initialSeedMsgs = [
  { you: 'Give me a national posture summary.' },
  { ai: (
    <>
      <strong>National Posture · 14:32 IST</strong>
      <ul>
        <li>312 healthy (75.7%) · 84 moderate · 16 critical</li>
        <li>Bellandur, Nakki, Surajkund, Hussain Sagar, Bhojtal flagged for immediate intervention</li>
        <li>8 active incidents, 23 teams deployed</li>
        <li>AI: 41 recommendations issued today — 28 accepted, 13 pending review</li>
      </ul>
      <div className="meta"><span className="pip" />14:32:08 · 4 sources</div>
    </>
  ) }
];

const recs = [
  { tone: 'warn', t: 'Issue advisory · Bellandur',        m1: 'Section 5',      m2: 'accepted', onAcc: true },
  { tone: '',     t: 'Reconfigure sensors · Chilika',     m1: 'OR-CTL-11/12',   m2: 'pending' },
  { tone: 'crit', t: 'Aerate NE basin · Bellandur',       m1: 'in progress',    m2: 'accepted', onAcc: true },
  { tone: '',     t: 'Deploy DO probes ×4 · Bellandur',   m1: 'portable kit',   m2: 'accepted', onAcc: true },
  { tone: 'warn', t: 'Citizen alert · Vembanad',          m1: 'tidal',          m2: 'pending' },
  { tone: '',     t: 'Calibrate pH probes · Dal',         m1: 'scheduled',      m2: 'accepted', onAcc: true },
  { tone: 'warn', t: 'Inspect outflow S-12 · Bellandur',  m1: 'in 4h',          m2: 'pending' }
];

const chips = ['Why is Dal healthy?', 'Compare Chilika & Vembanad', 'Forecast national WQI 7d', 'Dispatch summary', 'Top 5 risks'];

function parseInline(text) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ color: 'var(--on-surface)' }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

// Custom Markdown parser for tables and basic bold text
function renderAIResponse(text) {
  if (typeof text !== 'string') return text;
  
  const lines = text.split('\n');
  const blocks = [];
  let currentTable = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!currentTable) currentTable = [];
      currentTable.push(line);
    } else {
      if (currentTable) {
        blocks.push({ type: 'table', content: currentTable });
        currentTable = null;
      }
      blocks.push({ type: 'text', content: line });
    }
  }
  if (currentTable) blocks.push({ type: 'table', content: currentTable });

  return blocks.map((block, idx) => {
    if (block.type === 'table') {
      const rows = block.content.map(r => r.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1));
      if (rows.length < 3) return <div key={idx}>{block.content.join('\n')}</div>;
      
      const headers = rows[0];
      const data = rows.slice(2);

      return (
        <div key={idx} style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${headers.length}, 1fr)`, 
          gap: 1, 
          background: 'var(--surface-tint)', 
          border: '1px solid var(--surface-tint)',
          borderRadius: 8,
          overflow: 'hidden',
          margin: '12px 0'
        }}>
          {headers.map((h, i) => (
            <div key={'h'+i} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.05)', fontWeight: 'bold', fontSize: 13, color: 'var(--on-surface)' }}>
              {h.replace(/\*\*/g, '')}
            </div>
          ))}
          {data.map((row, rI) => 
            row.map((cell, cI) => {
              let content = cell;
              let isBold = content.includes('**');
              content = content.replace(/\*\*/g, '');
              
              // Icon mapping based on keywords
              let icon = '⚡';
              const lc = content.toLowerCase();
              if (lc.includes('fiber') || lc.includes('carb')) icon = '🌾';
              else if (lc.includes('fat') || lc.includes('heart')) icon = '❤️';
              else if (lc.includes('protein')) icon = '💪';
              else if (lc.includes('vitamin') || lc.includes('nutrient') || lc.includes('micro')) icon = '💊';
              else if (lc.includes('weight')) icon = '⚖️';
              else if (lc.includes('antioxidant')) icon = '✨';
              else if (lc.includes('versatil')) icon = '🍲';
              
              return (
                <div key={`${rI}-${cI}`} style={{ 
                  padding: '10px 12px', 
                  background: 'var(--surface)', 
                  fontSize: 13,
                  color: cI === 0 ? 'var(--secondary)' : 'var(--on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  lineHeight: 1.4
                }}>
                  {cI === 0 && <span style={{ fontSize: 16 }}>{icon}</span>}
                  <span style={{ fontWeight: isBold || cI === 0 ? 'bold' : 'normal' }}>{content}</span>
                </div>
              );
            })
          )}
        </div>
      );
    }
    
    // Regular text with basic bold parsing
    let textContent = block.content;
    if (!textContent) return <div key={idx} style={{ height: 8 }} />;
    
    if (textContent.startsWith('**Bottom line:**') || textContent.startsWith('**Conclusion:**')) {
      return <div key={idx} style={{ marginTop: 12, padding: 12, background: 'rgba(78, 222, 163, 0.1)', borderRadius: 6, borderLeft: '3px solid var(--secondary)' }}>
        {parseInline(textContent.replace(/\*\*/g, ''))}
      </div>;
    }

    return <div key={idx} style={{ marginBottom: 4 }}>{parseInline(textContent)}</div>;
  });
}

export default function Assistant() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(initialSeedMsgs);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [loading, setLoading] = useState(false);
  const [dynamicRecs, setDynamicRecs] = useState(recs);

  useEffect(() => {
    api.getModels().then(data => {
      setModels(data);
      if (data.length > 0) setSelectedModel(data[0]);
    }).catch(console.error);

    api.optimize().then(data => {
      if (data && data.recommendations && data.recommendations.length > 0) {
        setDynamicRecs(data.recommendations.slice(0, 5).map(r => ({
          tone: r.priority === 'High' ? 'crit' : 'warn',
          t: r.action,
          m1: r.target,
          m2: 'pending'
        })));
      }
    }).catch(console.error);
  }, []);

  async function send(text) {
    const t = (text || input).trim();
    if (!t || loading) return;
    
    setInput('');
    setMessages(prev => [...prev, { you: t }]);
    setLoading(true);

    try {
      const res = await api.assistant(t, selectedModel);
      setMessages(prev => [...prev, { ai: renderAIResponse(res.reply) }]);
    } catch (err) {
      setMessages(prev => [...prev, { ai: <div style={{ color: 'var(--error)' }}>Error: {err.message}</div> }]);
    } finally {
      setLoading(false);
    }
  }

  function startNewSession() {
    if (messages.length > 0 && messages !== initialSeedMsgs) {
      setHistory(h => [{ date: new Date().toLocaleTimeString(), msgs: messages }, ...h]);
    }
    setMessages([]);
    setShowHistory(false);
  }

  function loadSession(sess) {
    setMessages(sess.msgs);
    setShowHistory(false);
  }

  function deleteSession(e, index) {
    e.stopPropagation();
    setHistory(h => h.filter((_, i) => i !== index));
  }

  return (
    <div className="view active">
      <div className="section-h">
        <div><h1>AI Command Assistant</h1><div className="sub">Predictive analysis · natural-language queries · autonomous recommendations</div></div>
        <div className="actions" style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {models.length > 0 ? (
            <select 
              value={selectedModel} 
              onChange={e => setSelectedModel(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--surface-tint)', color: 'var(--on-surface)', padding: '6px 12px', borderRadius: 6 }}
            >
              {models.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          ) : (
            <span style={{ color: 'var(--surface-tint)', fontSize: 12 }}>No models found</span>
          )}
          <button className={`btn ghost ${showHistory ? 'active' : ''}`} onClick={() => setShowHistory(!showHistory)} style={{ background: showHistory ? 'var(--surface-tint)' : 'transparent' }}>History</button>
          <button className="btn" onClick={startNewSession}>New session</button>
        </div>
      </div>
      
      <div className="two-col">
        {showHistory ? (
          <div className="card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
             <div className="card-h"><h3>Session History</h3></div>
             <div style={{ flex: 1, padding: '10px 0' }}>
               {history.length === 0 ? <div style={{ color: 'var(--surface-tint)', fontStyle: 'italic', padding: 20 }}>No past sessions saved.</div> : 
                 history.map((h, i) => (
                   <div key={i} onClick={() => loadSession(h)} style={{ padding: '12px', background: 'var(--surface)', marginBottom: 8, borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <div>
                       <strong style={{ color: 'var(--secondary)' }}>Session at {h.date}</strong>
                       <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>{h.msgs.length} messages</div>
                     </div>
                     <button className="btn ghost" onClick={(e) => deleteSession(e, i)} style={{ padding: '4px 8px', color: 'var(--error)' }}>Delete</button>
                   </div>
                 ))
               }
             </div>
          </div>
        ) : (
          <div className="card glass" style={{ display: 'flex', flexDirection: 'column', minHeight: 520 }}>
            <div className="card-h"><h3>Conversation</h3><div className="right" style={{ color: 'var(--secondary)' }}>● AquaMind v3.2</div></div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 0', overflowY: 'auto' }}>
              {messages.length === 0 && <div style={{ color: 'var(--surface-tint)', fontStyle: 'italic', padding: 20 }}>How can I help you today?</div>}
              {messages.map((m, i) => (
                m.you
                  ? <div className="msg you" key={i}>{m.you}</div>
                  : <div className="msg ai" key={i}>{typeof m.ai === 'string' ? renderAIResponse(m.ai) : m.ai}</div>
              ))}
              {loading && (
                <div className="msg ai" style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '12px 16px', opacity: 0.7, alignSelf: 'flex-start', margin: '4px 0' }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--on-surface)', animation: 'ai-pulse 1.5s infinite ease-in-out' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--on-surface)', animation: 'ai-pulse 1.5s infinite ease-in-out 0.2s' }} />
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--on-surface)', animation: 'ai-pulse 1.5s infinite ease-in-out 0.4s' }} />
                  <style>{`
                    @keyframes ai-pulse {
                      0%, 100% { transform: scale(0.6); opacity: 0.4; }
                      50% { transform: scale(1.1); opacity: 1; }
                    }
                  `}</style>
                </div>
              )}
            </div>
            <div className="rp-quick">
              {chips.map(c => <span className="chip" key={c} onClick={() => send(c)}>{c}</span>)}
            </div>
            <div className="rp-input">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), send())}
                placeholder="Ask anything about the water network…"
              />
              <button className="rp-send" onClick={() => send()} aria-label="Send" disabled={loading}>
                {loading ? '…' : '↑'}
              </button>
            </div>
          </div>
        )}
        
        <div>
          <div className="card glass" style={{ marginBottom: 10 }}>
            <div className="card-h"><h3>Today's AI Recommendations</h3><div className="right">{dynamicRecs.length} issued</div></div>
            {dynamicRecs.map((r, i) => (
              <div className={'alert-item ' + r.tone} key={i}>
                <div className="t">{r.t}</div>
                <div className="m"><span>{r.m1}</span><span style={{ color: r.onAcc ? 'var(--secondary)' : 'var(--surface-tint)' }}>{r.m2}</span></div>
              </div>
            ))}
          </div>
          <div className="card glass">
            <div className="card-h"><h3>Model Performance · 7d</h3><div className="right">MAPE 4.8%</div></div>
            <svg viewBox="0 0 280 110" width="100%" height="110">
              <polyline fill="none" stroke="#4edea3" strokeWidth="1.6" points="0,80 30,72 60,76 90,60 120,64 150,52 180,56 210,42 240,46 270,32" />
              <polyline fill="none" stroke="#89ceff" strokeWidth="1.6" strokeDasharray="3 3" points="0,84 30,76 60,70 90,68 120,58 150,60 180,50 210,52 240,40 270,38" />
            </svg>
            <div style={{ display: 'flex', gap: 12, marginTop: 6, font: "500 9px/12px 'JetBrains Mono', monospace", color: 'var(--on-surface-variant)', letterSpacing: '.05em', textTransform: 'uppercase' }}>
              <span><span style={{ color: 'var(--secondary)' }}>—</span> Predicted</span>
              <span><span style={{ color: 'var(--surface-tint)' }}>- -</span> Actual</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
