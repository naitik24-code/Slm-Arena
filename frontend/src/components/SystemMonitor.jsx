import React from 'react';

export default function SystemMonitor({ data, isRunning, elapsedMs }) {
  const {
    cpu_percent = 0,
    memory_percent = 0,
    memory_used_mb = 0,
    memory_total_mb = 0,
    disk_percent = 0
  } = data || {};

  return (
    <div className="system-monitor-bar" aria-label="System resource monitor">
      <div className="sys-metrics-group">
        <div className="sys-item">
          <span className="sys-label">CPU</span>
          <div className="sys-progress-bg" title={`${cpu_percent}% CPU Usage`}>
            <div className="sys-fill cpu" style={{ width: `${cpu_percent}%` }}></div>
          </div>
          <span className="sys-val mono">{cpu_percent}%</span>
        </div>

        <div className="sys-item">
          <span className="sys-label">RAM</span>
          <div className="sys-progress-bg" title={`${memory_percent}% RAM Usage (${memory_used_mb}MB / ${memory_total_mb}MB)`}>
            <div className="sys-fill ram" style={{ width: `${memory_percent}%` }}></div>
          </div>
          <span className="sys-val mono">{memory_percent}%</span>
        </div>

        <div className="sys-item">
          <span className="sys-label">Disk</span>
          <div className="sys-progress-bg" title={`${disk_percent}% Disk Usage`}>
            <div className="sys-fill disk" style={{ width: `${disk_percent}%` }}></div>
          </div>
          <span className="sys-val mono">{disk_percent}%</span>
        </div>
      </div>

      <div className="sys-status">
        {/* 9. Running timer */}
        {isRunning && (
          <div 
            className="elapsed-timer mono" 
            aria-label="Benchmark elapsed time"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--primary)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '4px 10px',
              borderRadius: '6px'
            }}
          >
            <span role="img" aria-hidden="true">⏱</span> {(elapsedMs / 1000).toFixed(1)}s
          </div>
        )}
        
        <div className="status-indicator">
          <span className={`status-dot ${isRunning ? 'active' : ''}`}></span>
          <span className="status-text">{isRunning ? 'Benchmarking...' : 'Ready'}</span>
        </div>
      </div>
    </div>
  );
}
