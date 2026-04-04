import React, { useState } from 'react';
import { Plus, Trash2, Moon, Sun, CheckCircle2 } from 'lucide-react';

const MODEL_CONFIG = [
  { id: 'mistral', name: 'Mistral', tag: 'Balanced', color: '#E85A4F' },
  { id: 'phi3', name: 'Phi3', tag: 'Efficient', color: '#2563EB' },
  { id: 'llama3', name: 'LLaMA 3', tag: 'Capable', color: '#7C3AED' }
];

export default function Sidebar({ 
  conversations, 
  activeConversation, 
  selectedModels, 
  toggleModel, 
  compareMode, 
  setCompareMode,
  onNewChat, 
  onLoadChat, 
  onDeleteChat,
  systemMetrics,
  darkMode,
  setDarkMode,
  streamingTokens,
  isRunning
}) {
  const [shakeId, setShakeId] = useState(null);

  const handleToggle = (id) => {
    // If clicking an unselected model, make it the first (primary) one
    if (!selectedModels.includes(id)) {
      toggleModel(id);
      return;
    }
    
    // If clicking an already selected model and it's the only one, shake
    if (selectedModels.length === 1) {
      setShakeId(id);
      setTimeout(() => setShakeId(null), 200);
      return;
    }
    
    // Deselect if already selected
    toggleModel(id);
  };

  const { cpu_percent = 0, memory_percent = 0 } = systemMetrics || {};

  return (
    <aside className="sidebar">
      {/* Top section */}
      <div style={{ padding: '16px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ 
            width: '12px', height: '12px', borderRadius: '50%', 
            background: 'conic-gradient(from 0deg, var(--accent), var(--success), var(--warning), var(--accent))' 
          }} />
          <span style={{ fontSize: '15px', fontWeight: 600 }}>SLM Arena</span>
        </div>
        
        <button className="btn-new-chat" onClick={onNewChat}>
          <span>New Chat</span>
          <Plus size={16} />
        </button>
      </div>

      {/* Model Selector */}
      <div style={{ padding: '16px', overflowY: 'auto', flex: 1 }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
          Models
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {MODEL_CONFIG.map(m => {
            const isActive = selectedModels.includes(m.id);
            const stream = streamingTokens[m.id];
            
            return (
              <div 
                key={m.id} 
                className={`model-row ${shakeId === m.id ? 'shake' : ''}`}
                onClick={() => handleToggle(m.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '3px', height: '16px', borderRadius: '2px', backgroundColor: m.color }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: isActive ? 'var(--text)' : 'var(--text2)' }}>
                      {m.name}
                    </span>
                    {isRunning && isActive && !stream?.done && (
                      <span style={{ fontSize: '10px', color: m.color, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span className="typing-dot" style={{ backgroundColor: m.color, width: '4px', height: '4px' }} /> Generating...
                      </span>
                    )}
                    {stream?.done && isActive && (
                      <span style={{ fontSize: '10px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={10} /> Done {(stream.metrics?.latency_ms / 1000).toFixed(1)}s
                      </span>
                    )}
                  </div>
                </div>
                <div className={`pill-switch ${isActive ? 'active' : ''}`} />
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <div className="model-row" onClick={() => setCompareMode(!compareMode)}>
            <span style={{ fontSize: '13px', fontWeight: 500 }}>Compare mode</span>
            <div className={`pill-switch ${compareMode ? 'active' : ''}`} />
          </div>
        </div>

        {/* Chat History */}
        <div style={{ marginTop: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.05em' }}>
            History
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {conversations.map(c => (
              <div 
                key={c.id} 
                className={`model-row ${activeConversation?.id === c.id ? 'active' : ''}`}
                style={{ 
                  backgroundColor: activeConversation?.id === c.id ? 'var(--surface2)' : 'transparent',
                  padding: '8px 10px',
                  position: 'relative'
                }}
                onClick={() => onLoadChat(c.id)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1 }}>
                  <span style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {c.title}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text3)' }}>
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <button 
                  className="icon-btn-delete"
                  style={{ opacity: 0, transition: 'opacity 0.2s' }}
                  onClick={(e) => { e.stopPropagation(); onDeleteChat(c.id); }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--sidebar-bg)' }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--text3)' }}>CPU</span>
            <span className="mono">{cpu_percent}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${cpu_percent}%`, height: '100%', backgroundColor: cpu_percent > 80 ? 'var(--danger)' : 'var(--accent)', transition: 'width 0.3s' }} />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px', marginTop: '8px' }}>
            <span style={{ color: 'var(--text3)' }}>RAM</span>
            <span className="mono">{memory_percent}%</span>
          </div>
          <div style={{ width: '100%', height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ width: `${memory_percent}%`, height: '100%', backgroundColor: memory_percent > 80 ? 'var(--danger)' : 'var(--warning)', transition: 'width 0.3s' }} />
          </div>
        </div>

        <button 
          className="btn-new-chat" 
          onClick={() => setDarkMode(!darkMode)}
          style={{ justifyContent: 'center', gap: '8px' }}
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          <span>{darkMode ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>
      
      <style>{`
        .model-row:hover .icon-btn-delete { opacity: 1 !important; }
        .icon-btn-delete { background: none; border: none; color: var(--text3); cursor: pointer; padding: 4px; border-radius: 4px; }
        .icon-btn-delete:hover { color: var(--danger); background-color: rgba(239, 68, 68, 0.1); }
      `}</style>
    </aside>
  );
}
