import React from 'react';

export default function MessageBubble({ text, isUser = true }) {
  return (
    <div 
      className="animate-fade-up"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isUser ? 'flex-end' : 'flex-start',
        width: '100%',
        marginBottom: isUser ? '20px' : '0'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '4px',
        fontSize: '12px',
        color: 'var(--text2)',
        flexDirection: isUser ? 'row-reverse' : 'row'
      }}>
        <div style={{
          width: '24px',
          height: '24px',
          borderRadius: '50%',
          backgroundColor: isUser ? 'var(--accent)' : 'var(--surface2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          fontWeight: 600,
          color: 'white'
        }}>
          {isUser ? 'U' : 'AI'}
        </div>
        <span>{isUser ? 'You' : 'AI'}</span>
      </div>

      <div style={{
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: '16px',
        borderBottomRightRadius: isUser ? '4px' : '16px',
        borderBottomLeftRadius: isUser ? '16px' : '4px',
        backgroundColor: isUser ? 'var(--surface2)' : 'transparent',
        border: isUser ? '1px solid var(--border)' : 'none',
        color: 'var(--text)',
        fontSize: '15px',
        lineHeight: '1.6',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      }}>
        {text}
      </div>
    </div>
  );
}
