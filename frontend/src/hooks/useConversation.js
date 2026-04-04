import { useState, useEffect } from 'react';

const STORAGE_KEY = 'slm-conversations';

export function useConversation() {
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load conversations from localStorage", e);
      return [];
    }
  });
  
  const [activeConversation, setActiveConversation] = useState(null);

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    } catch (e) {
      console.error("Failed to save conversations to localStorage", e);
    }
  }, [conversations]);

  const newConversation = () => {
    setActiveConversation({
      id: Date.now().toString(),
      title: 'New Chat',
      createdAt: new Date().toISOString(),
      turns: []
    });
  };

  const addTurn = (prompt, results = []) => {
    const turnId = Date.now().toString();
    const newTurn = { id: turnId, prompt, results, timestamp: Date.now() };

    setActiveConversation(prev => {
      let updatedConv;
      if (!prev) {
        // Create new if none active
        updatedConv = {
          id: Date.now().toString(),
          title: prompt.substring(0, 40) || 'New Chat',
          createdAt: new Date().toISOString(),
          turns: [newTurn]
        };
      } else {
        const updatedTurns = [...prev.turns, newTurn];
        updatedConv = { ...prev, turns: updatedTurns };
        
        // Update title if it's the first turn
        if (prev.turns.length === 0) {
          updatedConv.title = prompt.substring(0, 40) || 'New Chat';
        }
      }

      setConversations(old => {
        const filtered = old.filter(c => c.id !== updatedConv.id);
        return [updatedConv, ...filtered].slice(0, 20);
      });

      return updatedConv;
    });
    
    return turnId;
  };

  const updateTurnResults = (turnId, results) => {
    setActiveConversation(prev => {
      if (!prev) return prev;
      
      const updatedTurns = prev.turns.map(t => 
        t.id === turnId ? { ...t, results } : t
      );
      
      const updatedConv = { ...prev, turns: updatedTurns };
      
      setConversations(old => {
        const filtered = old.filter(c => c.id !== updatedConv.id);
        return [updatedConv, ...filtered].slice(0, 20);
      });
      
      return updatedConv;
    });
  };

  const loadConversation = (id) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) setActiveConversation(conv);
  };

  const deleteConversation = (id) => {
    setConversations(old => old.filter(c => c.id !== id));
    if (activeConversation?.id === id) {
      setActiveConversation(null);
    }
  };

  return {
    conversations,
    activeConversation,
    addTurn,
    newConversation,
    loadConversation,
    deleteConversation,
    setActiveConversation,
    updateTurnResults
  };
}
