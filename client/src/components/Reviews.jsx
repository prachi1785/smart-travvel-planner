import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Share2, Send, Loader } from 'lucide-react';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState('');

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(data => {
        setReviews(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
        setLoading(false);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    
    // Optimistic UI update or wait for API
    const newNote = {
      user: 'You',
      avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
      destination: 'General Note',
      text: newReview,
      likes: 0,
      dateString: 'Just now'
    };
    
    setReviews([newNote, ...reviews]);
    setNewReview('');
    
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNote)
    }).catch(err => console.error('Error posting review:', err));
  };

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Loader className="text-primary animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }} className="animate-fade-in">
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Traveler <span className="text-gradient">Notes</span></h2>
        <p className="text-muted">Discover tips and share experiences with the community.</p>
      </div>

      {/* Input Form */}
      <div className="glass-panel" style={{ marginBottom: '3rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <img 
            src="https://randomuser.me/api/portraits/lego/1.jpg" 
            alt="User" 
            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <div style={{ flex: 1 }}>
            <textarea 
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              placeholder="Share a travel tip or review..."
              className="input-field"
              style={{ minHeight: '100px', resize: 'vertical', borderRadius: '1rem', marginBottom: '0.75rem' }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="btn btn-primary" disabled={!newReview.trim()}>
                <Send size={16} /> Post Note
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Reviews List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {reviews.map((review, i) => (
          <div 
            key={review._id || review.id || i}
            className="glass-card animate-fade-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div style={{ display: 'flex', gap: '1rem' }}>
              <img 
                src={review.avatar} 
                alt={review.user} 
                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                  <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.1rem', letterSpacing: 'normal', textTransform: 'none' }}>
                    {review.user}
                  </h4>
                  <span className="text-muted" style={{ fontSize: '0.85rem' }}>{review.dateString}</span>
                </div>
                
                <div style={{ display: 'inline-block', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.8rem', marginBottom: '0.75rem', fontWeight: 500 }}>
                  <MessageSquare size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />
                  {review.destination}
                </div>
                
                <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text)', lineHeight: 1.6 }}>
                  {review.text}
                </p>
                
                <div style={{ display: 'flex', gap: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1rem', alignitems: 'center' }}>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-danger)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                    <Heart size={18} /> <span>{review.likes}</span>
                  </button>
                  <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--color-primary)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--color-text-muted)'}>
                    <Share2 size={18} /> <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Reviews;
