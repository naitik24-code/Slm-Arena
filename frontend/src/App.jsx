import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatFeed from './components/ChatFeed';
import InputBar from './components/InputBar';
import { useSystemMetrics } from './hooks/useSystemMetrics';
import { useBenchmark } from './hooks/useBenchmark';
import { useConversation } from './hooks/useConversation';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('slm-theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  const [selectedModels, setSelectedModels] = useState(['mistral', 'phi3', 'llama3']);
  const [compareMode, setCompareMode] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { systemMetrics } = useSystemMetrics();
  const { conversations, activeConversation, addTurn, updateTurnResults, newConversation, loadConversation, deleteConversation } = useConversation();
  
  const { isRunning, results, streamingTokens, elapsedMs, runBenchmark, abort } = useBenchmark({ 
    selectedModels, 
    compareMode 
  });

  // Theme Persistence
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-dark', darkMode ? 'true' : 'false');
    localStorage.setItem('slm-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Model Toggle Logic
  const toggleModel = (id) => {
    setSelectedModels(prev => 
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  const handleRun = async (promptText) => {
    // Add turn immediately with empty results for UI feedback
    const turnId = addTurn(promptText, []);
    
    // Clear prompt input
    setPrompt("");
    
    // Run benchmark
    const finalResults = await runBenchmark(promptText);
    
    // Update the same turn with actual results
    updateTurnResults(turnId, finalResults);
  };

  return (
    <div className="app-layout">
      <Sidebar 
        conversations={conversations}
        activeConversation={activeConversation}
        selectedModels={selectedModels}
        toggleModel={toggleModel}
        compareMode={compareMode}
        setCompareMode={setCompareMode}
        onNewChat={() => { newConversation(); setPrompt(""); }}
        onLoadChat={loadConversation}
        onDeleteChat={deleteConversation}
        systemMetrics={systemMetrics}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        streamingTokens={streamingTokens}
        isRunning={isRunning}
      />

      <div className="main-content">
        {/* Chat Header */}
        <header style={{ 
          height: '56px', 
          borderBottom: '1px solid var(--border)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '0 20px',
          backgroundColor: 'var(--bg)',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button 
              className="icon-btn-small" 
              style={{ display: 'none' }} // Visible on mobile via CSS
              onClick={() => setIsSidebarOpen(true)}
            >
              {/* Hamburger Icon would go here */}
            </button>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {activeConversation?.title || 'SLM Arena'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* System Status Pill */}
            {systemMetrics && (
              <div style={{ 
                fontSize: '11px', 
                fontWeight: 600, 
                padding: '4px 10px', 
                borderRadius: '12px',
                backgroundColor: 'var(--surface2)',
                color: systemMetrics.cpu_percent > 80 || systemMetrics.memory_percent > 80 ? 'var(--danger)' : 'var(--success)',
                border: '1px solid var(--border)'
              }}>
                {systemMetrics.cpu_percent > systemMetrics.memory_percent 
                  ? `CPU ${systemMetrics.cpu_percent}%` 
                  : `RAM ${systemMetrics.memory_percent}%`
                }
              </div>
            )}
          </div>
        </header>

        <ChatFeed 
          activeConversation={activeConversation}
          streamingTokens={streamingTokens}
          isRunning={isRunning}
          history={conversations}
        />

        <InputBar 
          prompt={prompt}
          setPrompt={setPrompt}
          onRun={handleRun}
          onAbort={abort}
          isRunning={isRunning}
          selectedModelsCount={compareMode ? selectedModels.length : 1}
        />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .icon-btn-small { display: block !important; }
        }
      `}</style>
    </div>
  );
}
