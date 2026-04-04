import React, { useState, useEffect, useRef } from 'react';
import { Send, Square, ChevronDown } from 'lucide-react';

const TEMPLATES = [
  { id: 'summarize', label: '📝 Summarize', prompt: 'Please summarize the following text in 3 bullet points:\n\n' },
  { id: 'code', label: '💻 Write code', prompt: 'Write a clean, efficient function in Python that:\n\n' },
  { id: 'creative', label: '🎨 Creative writing', prompt: 'Write a short, engaging story about:\n\n' },
  { id: 'reasoning', label: '🧩 Reasoning puzzle', prompt: 'Solve this logical reasoning puzzle step-by-step:\n\n' },
  { id: 'compare', label: '⚖️ Compare concepts', prompt: 'Explain the key differences between [concept A] and [concept B]:\n\n' }
];

export default function InputBar({ prompt, setPrompt, onRun, onAbort, isRunning, selectedModelsCount }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);

  // Auto-growing textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 24), 144); // 6 rows max (approx 24px each)
      textarea.style.height = newHeight + 'px';
    }
  }, [prompt]);

  // Click outside listener for dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRunning) {
      onAbort();
    } else if (prompt.trim()) {
      onRun(prompt);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  const selectTemplate = (template) => {
    setPrompt(template.prompt);
    setIsDropdownOpen(false);
    textareaRef.current?.focus();
  };

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <form onSubmit={handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', padding: '8px 12px' }}>
          
          {/* Template Dropdown */}
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button 
              type="button"
              className="icon-btn-small"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                padding: '8px 12px',
                borderRadius: '20px',
                backgroundColor: 'transparent',
                color: 'var(--text2)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <span>Template</span>
              <ChevronDown size={14} />
            </button>
            
            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 12px)',
                left: '0',
                width: '180px',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '10px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)',
                zIndex: 1000,
                overflow: 'hidden',
                animation: 'fade-up 150ms ease-out'
              }}>
                {TEMPLATES.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => selectTemplate(t)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      textAlign: 'left',
                      fontSize: '13px',
                      color: 'var(--text)',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.1s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--surface2)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            className="mono"
            placeholder="Message SLM Arena…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text)',
              fontSize: '14px',
              padding: '10px 12px',
              resize: 'none',
              maxHeight: '144px',
              outline: 'none',
              lineHeight: '1.5'
            }}
          />

          {/* Send/Stop Button */}
          <button 
            type="submit" 
            className={`btn-send ${isRunning ? 'btn-stop' : ''}`}
            disabled={!isRunning && !prompt.trim()}
            style={{ marginBottom: '4px' }}
          >
            {isRunning ? <Square size={16} fill="white" /> : <Send size={16} />}
          </button>
        </form>
      </div>

      <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text3)', display: 'flex', gap: '12px' }}>
        <span>{selectedModelsCount} models selected</span>
        <span>•</span>
        <span>Ctrl+Enter to send</span>
        <span>•</span>
        <span>Esc to stop</span>
      </div>
    </div>
  );
}
