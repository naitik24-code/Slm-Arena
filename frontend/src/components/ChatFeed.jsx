import React, { useEffect, useRef, useState } from 'react';
import MessageBubble from './MessageBubble';
import ResponseCard from './ResponseCard';
import ComparisonSummary from './ComparisonSummary';
import MetricsDashboard from './MetricsDashboard';

export default function ChatFeed({ activeConversation, streamingTokens, isRunning, history }) {
  const feedRef = useRef(null);
  const [fastestModel, setFastestModel] = useState(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTo({
        top: feedRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [streamingTokens, activeConversation?.turns?.length]);

  // Determine fastest model once a turn finishes
  useEffect(() => {
    if (!isRunning && activeConversation?.turns?.length > 0) {
      const lastTurn = activeConversation.turns[activeConversation.turns.length - 1];
      const validResults = (lastTurn.results || []).filter(r => !r.error && r.latency_ms > 0);
      
      if (validResults.length > 0) {
        const sorted = [...validResults].sort((a, b) => a.latency_ms - b.latency_ms);
        setFastestModel(sorted[0].model);
      }
    } else if (isRunning) {
      setFastestModel(null);
    }
  }, [isRunning, activeConversation?.turns]);

  if (!activeConversation) {
    return (
      <div className="chat-container">
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: 'var(--text3)',
          textAlign: 'center',
          gap: '12px'
        }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', 
            background: 'conic-gradient(from 0deg, var(--accent), var(--success), var(--warning), var(--accent))',
            opacity: 0.2,
            marginBottom: '12px'
          }} />
          <h2 style={{ color: 'var(--text)', fontSize: '1.5rem', fontWeight: 600 }}>SLM Arena</h2>
          <p style={{ maxWidth: '300px', fontSize: '14px' }}>
            Start a new benchmark chat to compare small language models.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container" ref={feedRef}>
      <div className="chat-thread">
        {activeConversation.turns.map((turn, turnIdx) => {
          const isLastTurn = turnIdx === activeConversation.turns.length - 1;
          const currentStreaming = isLastTurn && isRunning ? streamingTokens : {};
          
          // Determine if we should show results or streaming state
          const hasResults = turn.results && turn.results.length > 0;
          const isActivelyStreaming = isLastTurn && isRunning && Object.keys(streamingTokens).length > 0;

          return (
            <div key={turn.id} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <MessageBubble text={turn.prompt} isUser={true} />
              
              <div className={`model-panel-grid ${(hasResults ? turn.results.length : Object.keys(currentStreaming).length) > 1 ? 'compare-on' : ''}`}>
                {/* Show completed results if they exist */}
                {hasResults && turn.results.map(res => (
                  <ResponseCard 
                    key={res.model}
                    model={res.model}
                    state={{ text: res.response, done: true, metrics: res }}
                    isFastest={res.model === fastestModel && isLastTurn}
                  />
                ))}

                {/* Show active streaming if it's the last turn and no results yet */}
                {!hasResults && isActivelyStreaming && Object.entries(streamingTokens).map(([model, state]) => (
                  <ResponseCard 
                    key={model}
                    model={model}
                    state={state}
                    isFastest={false}
                  />
                ))}
                
                {/* Fallback for when benchmark is starting but no tokens yet */}
                {!hasResults && isLastTurn && isRunning && Object.keys(streamingTokens).length === 0 && (
                   <div style={{ color: 'var(--text3)', fontSize: '13px', padding: '10px', backgroundColor: 'var(--surface2)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                     Benchmarking started... Initializing models (Llama3 might take up to 3 mins to load)...
                   </div>
                )}
              </div>

              {hasResults && isLastTurn && !isRunning && turn.results.length > 1 && (
                <>
                  <ComparisonSummary results={turn.results} />
                  <MetricsDashboard results={turn.results} history={history} />
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
