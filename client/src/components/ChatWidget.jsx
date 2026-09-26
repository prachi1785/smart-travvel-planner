import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Compass, Loader } from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: 'Hello! I am your **WanderSmart AI Assistant**. 🤖\n\nI can help you review your budget, show your schedule, or even update your trip in real-time. Try typing:\n- *"What is my budget?"*\n- *"Show my itinerary"*\n- *"Add expense Taxi booking 1200"*\n- *"Add activity Parasailing at 10:00 AM on day 2"*\n- *"Give me tips for Goa"*'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!res.ok) {
        throw new Error('Could not get response from AI');
      }

      const data = await res.json();
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);

      // Trigger a reload in other tabs if an action was executed
      if (data.action) {
        window.dispatchEvent(new Event('trip-updated'));
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'bot', text: '⚠️ Sorry, I encountered an error communicating with the server. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageText = (text) => {
    // Basic Markdown parser: **bold** -> <strong>, \n -> <br/>
    let formatted = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
    return <span dangerouslySetInnerHTML={{ __html: formatted }} />;
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 1000, fontFamily: 'var(--font-sans)' }}>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(139, 92, 246, 0.4)',
            transition: 'transform 0.2s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <MessageSquare size={26} />
        </button>
      )}

      {/* Chat Window Panel */}
      {isOpen && (
        <div 
          className="glass-panel"
          style={{
            width: '380px',
            height: '520px',
            display: 'flex',
            flexDirection: 'column',
            padding: 0,
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 12px 48px rgba(0, 0, 0, 0.5)'
          }}
        >
          {/* Header */}
          <div 
            style={{ 
              padding: '1.25rem 1.5rem', 
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.15))',
              borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', padding: '0.4rem', borderRadius: '0.5rem', color: 'white', display: 'flex' }}>
                <Compass size={16} />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--color-text)', textTransform: 'none', letterSpacing: 'normal' }}>WanderSmart AI</h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--color-success)', display: 'inline-block' }} /> Online Agent
                </span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} style={{ color: 'var(--color-text-muted)', cursor: 'pointer' }}>
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {messages.map((msg, i) => {
              const isBot = msg.sender === 'bot';
              return (
                <div 
                  key={i} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: isBot ? 'flex-start' : 'flex-end',
                    width: '100%'
                  }}
                >
                  <div 
                    style={{ 
                      maxWidth: '85%', 
                      background: isBot ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                      color: isBot ? 'var(--color-text)' : 'white',
                      padding: '0.85rem 1.1rem',
                      borderRadius: isBot ? '0 1rem 1rem 1rem' : '1rem 0 1rem 1rem',
                      fontSize: '0.9rem',
                      lineHeight: '1.5',
                      border: isBot ? '1px solid rgba(255,255,255,0.05)' : 'none',
                      textAlign: 'left'
                    }}
                  >
                    {renderMessageText(msg.text)}
                  </div>
                </div>
              );
            })}
            
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.85rem 1.25rem', borderRadius: '0 1rem 1rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Loader size={14} className="animate-spin text-muted" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>AI is typing...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={handleSubmit}
            style={{ 
              padding: '1rem', 
              borderTop: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(0, 0, 0, 0.2)',
              display: 'flex',
              gap: '0.75rem'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask about budget or add an activity..."
              style={{
                flex: 1,
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '999px',
                padding: '0.6rem 1.25rem',
                color: 'white',
                fontSize: '0.9rem',
                outline: 'none'
              }}
              disabled={loading}
            />
            <button
              type="submit"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              disabled={loading || !input.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
