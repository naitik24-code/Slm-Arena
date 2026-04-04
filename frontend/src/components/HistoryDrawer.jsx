import React, { useEffect, useRef } from 'react';
import { X, History, Trash2 } from 'lucide-react';

export default function HistoryDrawer({ isOpen, onClose, history, onSelect, onClear }) {
  const drawerRef = useRef(null);

  // 12. Focus Trap Implementation
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    const focusableElements = drawer.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    // Set initial focus
    firstElement?.focus();

    window.addEventListener('keydown', handleTabKey);
    return () => window.removeEventListener('keydown', handleTabKey);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="history-overlay" onClick={onClose} role="none">
      <div 
        className="history-drawer" 
        onClick={e => e.stopPropagation()} 
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Benchmark History"
      >
        <div className="history-header">
          <div className="history-title">
            <History size={18} />
            Recent Benchmarks
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close history drawer">
            <X size={20} />
          </button>
        </div>

        <div className="history-list">
          {history.length === 0 ? (
            <div className="history-empty">No history yet</div>
          ) : (
            history.map((item, idx) => (
              <div key={idx} className="history-item" onClick={() => { onSelect(item.prompt); onClose(); }}>
                <div className="history-item-prompt">{item.prompt}</div>
                <div className="history-item-meta">
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  {item.fastest_model && (
                    <span className="fastest-tag">⚡ {item.fastest_model}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && onClear && (
          <div className="history-footer">
            <button className="clear-btn" onClick={onClear} aria-label="Clear all history">
              <Trash2 size={16} />
              Clear History
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
