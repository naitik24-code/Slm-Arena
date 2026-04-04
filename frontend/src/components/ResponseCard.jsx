import React, { useRef, useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

const MODEL_COLORS = {
  mistral: '#E85A4F',
  phi3: '#2563EB',
  llama3: '#7C3AED'
};

const MODEL_TAGS = {
  mistral: 'Balanced',
  phi3: 'Efficient',
  llama3: 'Capable'
};

function round2(num) {
  if (num === null || num === undefined) return 0;
  return Math.round(num * 100) / 100;
}

export default function ResponseCard({ model, state, isFastest, showFullWidth = false }) {
  const contentRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const { text, done, error, metrics } = state || {};

  const handleCopy = () => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const wordCount = text ? text.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = text ? text.length : 0;

  return (
    <div 
      className={`animate-fade-up ${done ? 'panel-result-enter' : ''}`}
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '400px',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        width: '100%'
      }}
      role="region" 
      aria-label={`${model} response`}
    >
      <div style={{
        padding: '10px 14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: MODEL_COLORS[model],
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
          <span style={{ textTransform: 'capitalize' }}>{model}</span>
          <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>
            {MODEL_TAGS[model]}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {isFastest && <span className="badge fastest" style={{ backgroundColor: '#fcd34d', color: '#92400e', fontWeight: 600, fontSize: '10px', padding: '2px 6px', borderRadius: '4px' }}>⚡ Fastest</span>}
          
          {text && (
            <button 
              className="icon-btn-small" 
              onClick={handleCopy}
              style={{
                padding: '4px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer'
              }}
              title="Copy response"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          )}
        </div>
      </div>
      
      <div 
        className="panel-content mono" 
        ref={contentRef}
        style={{
          flex: 1,
          padding: '14px',
          fontSize: '13px',
          lineHeight: '1.6',
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          color: 'var(--text)'
        }}
      >
        {!text && !done && (
          <div aria-hidden="true" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '4px' }}>
              Initializing model... (this may take 1-2 mins for large models like Llama3)
            </div>
            <div className="skeleton-line skeleton"></div>
            <div className="skeleton-line skeleton"></div>
            <div className="skeleton-line skeleton"></div>
          </div>
        )}
        
        {error ? (
          <div className="error-banner" role="alert" style={{ color: 'var(--danger)', fontSize: '12px' }}>{error}</div>
        ) : (
          <>
            {text}
            {!done && (
              <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '4px' }}>
                {!text && (
                  <div style={{ display: 'inline-flex', gap: '4px' }}>
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                )}
                {text && <span className="blinking-cursor"></span>}
              </span>
            )}
            
            {done && text && (
              <div style={{ marginTop: '12px', fontSize: '11px', color: 'var(--text3)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                {wordCount} words · {charCount.toLocaleString()} chars
              </div>
            )}
          </>
        )}
      </div>

      <div style={{ padding: '8px 14px', backgroundColor: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
        <span className="metric" style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>Lat: {round2(metrics?.latency_ms)}ms</span>
        <span className="metric" style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>Speed: {round2(metrics?.tokens_per_second)}t/s</span>
        <span className="metric" style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'JetBrains Mono' }}>Tok: {metrics?.token_count || 0}</span>
      </div>
    </div>
  );
}
