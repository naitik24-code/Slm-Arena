import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  Cell
} from "recharts";
import { ChevronDown, ChevronUp, Download } from 'lucide-react';

const MODEL_COLORS = {
  mistral: '#E85A4F',
  phi3: '#2563EB',
  llama3: '#7C3AED'
};

const formatVal = (val, decimals = 1) => {
  if (typeof val !== 'number') return '0.0';
  return val.toFixed(decimals);
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}>
        <p style={{ fontWeight: 600, marginBottom: '4px', color: 'var(--text)' }}>{label}</p>
        {payload.map((entry, index) => (
          <p key={index} style={{ color: entry.color || entry.fill }}>
            {entry.name}: {formatVal(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const MetricsDashboard = ({ results = [], history = [] }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('Latency');
  const [isExported, setIsExported] = useState(false);

  if (!results || results.length === 0) return null;

  const validResults = results.filter(r => !r.error);

  const handleExport = () => {
    const data = JSON.stringify({ results, history }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.href = url;
    link.download = `slm-benchmark-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setIsExported(true);
    setTimeout(() => setIsExported(false), 2000);
  };

  const tabs = ["Latency", "Tokens/s", "CPU", "Memory", "History"];

  const getChartData = () => {
    switch (activeTab) {
      case 'Latency':
        return validResults.map(r => ({ name: r.model, value: r.latency_ms }));
      case 'Tokens/s':
        return validResults.map(r => ({ name: r.model, value: r.tokens_per_second }));
      case 'CPU':
        return validResults.map(r => ({ name: r.model, value: r.cpu_percent }));
      case 'Memory':
        return validResults.map(r => ({ name: r.model, value: r.memory_mb }));
      case 'History':
        const lastRuns = (history || []).slice(-8);
        return lastRuns.map((run, idx) => {
          const entry = { name: `#${history.length - lastRuns.length + idx + 1}` };
          if (run && Array.isArray(run.results)) {
            run.results.forEach(r => {
              if (r && !r.error && r.model) {
                entry[r.model] = r.latency_ms;
              }
            });
          }
          return entry;
        });
      default:
        return [];
    }
  };

  const chartData = getChartData();

  return (
    <div style={{
      width: '100%',
      maxWidth: 'var(--input-width)',
      marginBottom: '20px'
    }}>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '13px',
          color: 'var(--text2)',
          backgroundColor: 'transparent',
          border: 'none',
          padding: '8px 0',
          cursor: 'pointer'
        }}
      >
        <span>View performance metrics</span>
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {isExpanded && (
        <div 
          className="animate-fade-up"
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '20px',
            marginTop: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--border)', flex: 1 }}>
              {tabs.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '10px 4px',
                    fontSize: '13px',
                    fontWeight: activeTab === tab ? 500 : 400,
                    color: activeTab === tab ? 'var(--text)' : 'var(--text3)',
                    borderBottom: activeTab === tab ? '2px solid var(--text)' : '2px solid transparent',
                    marginBottom: '-1px'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <button 
              onClick={handleExport}
              style={{
                marginLeft: '16px',
                padding: '6px 12px',
                backgroundColor: isExported ? 'var(--success)' : 'var(--surface3)',
                color: isExported ? 'white' : 'var(--text)',
                borderRadius: '6px',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                border: '1px solid var(--border)'
              }}
            >
              <Download size={14} />
              {isExported ? 'Exported!' : 'Export JSON'}
            </button>
          </div>

          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              {activeTab === 'History' ? (
                history.length >= 2 ? (
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text3)', fontSize: 11 }} 
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--text3)', fontSize: 11 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconType="circle" />
                    {Object.keys(MODEL_COLORS).map(model => (
                      <Line
                        key={model}
                        type="monotone"
                        dataKey={model}
                        stroke={MODEL_COLORS[model]}
                        strokeWidth={2}
                        dot={{ r: 3, fill: MODEL_COLORS[model], strokeWidth: 0 }}
                        activeDot={{ r: 5, strokeWidth: 0 }}
                        connectNulls
                      />
                    ))}
                  </LineChart>
                ) : (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '13px' }}>
                    Need at least 2 runs to show history
                  </div>
                )
              ) : (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text3)', fontSize: 11 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: 'var(--text3)', fontSize: 11 }}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg)', opacity: 0.4 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={MODEL_COLORS[entry.name] || 'var(--accent)'} />
                    ))}
                  </Bar>
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default MetricsDashboard;
