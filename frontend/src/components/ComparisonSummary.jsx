import React from 'react';
import { Zap, FileText, Cpu } from 'lucide-react';

export default function ComparisonSummary({ results = [] }) {
  if (!results || results.length === 0) return null;

  // Filter out results with errors
  const validResults = results.filter(r => !r.error && r.latency_ms > 0);
  if (validResults.length === 0) return null;

  const fastest = [...validResults].sort((a, b) => a.latency_ms - b.latency_ms)[0];
  const mostVerbose = [...validResults].sort((a, b) => (b.response?.length || 0) - (a.response?.length || 0))[0];
  const leastCpu = [...validResults].sort((a, b) => a.cpu_percent - b.cpu_percent)[0];

  return (
    <div 
      className="animate-fade-up"
      style={{
        backgroundColor: 'var(--surface)',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        width: '100%',
        maxWidth: 'var(--input-width)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
        margin: '20px 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text2)' }}>
        <Zap size={16} color="var(--warning)" />
        <span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{fastest.model}</span> was fastest ({(fastest.latency_ms / 1000).toFixed(1)}s)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text2)' }}>
        <FileText size={16} color="var(--primary)" />
        <span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{mostVerbose.model}</span> was most verbose ({(mostVerbose.response?.length || 0).toLocaleString()} chars)
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--text2)' }}>
        <Cpu size={16} color="var(--success)" />
        <span>
          <span style={{ fontWeight: 600, color: 'var(--text)' }}>{leastCpu.model}</span> used least CPU ({leastCpu.cpu_percent.toFixed(1)}%)
        </span>
      </div>
    </div>
  );
}
