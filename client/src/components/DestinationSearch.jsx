import React, { useState, useEffect } from 'react';
import { Search, MapPin, Star, ArrowRight, Loader } from 'lucide-react';

const DestinationSearch = ({ onSelectDestination }) => {
  const [query, setQuery] = useState('');
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/destinations')
      .then(res => res.json())
      .then(data => {
        setDestinations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching destinations:', err);
        setLoading(false);
      });
  }, []);
  
  const filtered = destinations.filter(d => 
    d.name.toLowerCase().includes(query.toLowerCase()) ||
    d.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Search Bar */}
      <div 
        className="glass-panel animate-fade-in" 
        style={{ 
          width: '100%', 
          maxWidth: '800px', 
          display: 'flex', 
          alignItems: 'center',
          gap: '1rem',
          padding: '0.75rem 1rem',
          borderRadius: '999px',
          marginBottom: '3rem'
        }}
      >
        <Search className="text-muted" size={24} style={{ marginLeft: '1rem' }} />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by city, state, or vibe (e.g., 'Hill Station', 'Beaches')" 
          style={{ 
            flex: 1, 
            background: 'transparent', 
            border: 'none', 
            outline: 'none',
            fontSize: '1.25rem',
            color: 'var(--color-text)'
          }} 
        />
        <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
          Explore
        </button>
      </div>

      {/* Results Grid */}
      <h3 className="animate-fade-in delay-100" style={{ width: '100%', textAlign: 'left', marginBottom: '1.5rem' }}>
        {query ? 'Search Results' : 'Trending Destinations'}
      </h3>
      
      {loading ? (
        <div style={{ padding: '3rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
          <Loader className="text-primary animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
          gap: '2rem',
          width: '100%'
        }}>
        {filtered.map((dest, index) => (
          <div 
            key={dest._id || dest.id || index} 
            className={`glass-card animate-fade-in`} 
            style={{ 
              animationDelay: `${100 + index * 100}ms`,
              padding: 0, 
              overflow: 'hidden',
              cursor: 'pointer'
            }}
            onClick={() => onSelectDestination && onSelectDestination(dest)}
          >
            <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
              <img 
                src={dest.image} 
                alt={dest.name} 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transition: 'transform 0.5s ease'
                }} 
              />
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', padding: '0.25rem 0.75rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Star size={14} className="text-warning" fill="currentColor" />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{dest.rating}</span>
              </div>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                <h4 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.35rem', textTransform: 'none', letterSpacing: 'normal' }}>{dest.name}</h4>
                <span className="text-muted" style={{ fontWeight: 600 }}>{dest.priceLevel}</span>
              </div>
              
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {dest.description}
              </p>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {dest.tags.map(tag => (
                  <span key={tag} style={{ background: 'rgba(255,255,255,0.1)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', color: 'var(--color-primary)' }}>
                    {tag}
                  </span>
                ))}
              </div>
              
              <button 
                className="btn" 
                style={{ 
                  width: '100%', 
                  background: 'rgba(139, 92, 246, 0.1)', 
                  color: 'var(--color-primary)'
                }}
              >
                Plan Itinerary <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && query && (
          <div className="glass-panel text-center animate-fade-in" style={{ gridColumn: '1 / -1', padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <MapPin size={48} className="text-primary" style={{ opacity: 0.8 }} />
            <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '2rem' }}>Plan a Custom Trip to "{query}"</h3>
            <p className="text-muted" style={{ maxWidth: '500px', margin: '0 auto' }}>
              We couldn't find curated guides for this spot, but you can build your own custom itinerary and budget from scratch!
            </p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem', padding: '0.75rem 2rem' }}
              onClick={() => onSelectDestination && onSelectDestination({ name: query })}
            >
              Plan Trip to {query}
            </button>
          </div>
        )}
        {filtered.length === 0 && !query && (
          <div className="glass-panel text-center" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
            <MapPin size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 className="text-muted">No destinations loaded</h3>
            <p className="text-muted text-sm">Please check your database connection.</p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default DestinationSearch;
