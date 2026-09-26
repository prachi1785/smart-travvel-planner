import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Coffee, Activity, Hotel, Plus, GripVertical, Loader } from 'lucide-react';

const icons = {
  lodging: Hotel,
  food: Coffee,
  activity: Activity,
  transport: Clock
};

const Itinerary = () => {
  const [itinerary, setItinerary] = useState([]);
  const [activeTrip, setActiveTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadItinerary = () => {
    const token = localStorage.getItem('token');

    // Fetch active trip details
    fetch('/api/trips/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(trip => setActiveTrip(trip))
      .catch(err => console.error('Error fetching active trip:', err));

    // Fetch itinerary days
    fetch('/api/itineraries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setItinerary(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching itineraries:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadItinerary();
    window.addEventListener('trip-updated', loadItinerary);
    return () => window.removeEventListener('trip-updated', loadItinerary);
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '4rem', display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
        <Loader className="text-primary animate-spin" size={40} style={{ animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Your {activeTrip ? <span className="text-gradient">{activeTrip.destination}</span> : <span className="text-gradient">Itinerary</span>}
          </h2>
          <p className="text-muted">
            {activeTrip ? `${activeTrip.numberOfDays} Days Trip | Style: ${activeTrip.budgetStyle}` : 'Organize your days and make the most of your trip.'}
          </p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            const dayTitle = window.prompt("Enter title for the new day (e.g., 'Day 3: Exploring Local Sights'):");
            if (!dayTitle) return;
            const token = localStorage.getItem('token');
            fetch('/api/itineraries/day', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ dayTitle })
            })
            .then(res => {
              if (!res.ok) throw new Error('Failed to add day');
              return res.json();
            })
            .then(newDay => {
              setItinerary([...itinerary, newDay]);
            })
            .catch(err => alert(err.message));
          }}
        >
          <Plus size={18} /> Add Day
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
        {itinerary.map((dayPlan, dayIndex) => (
          <div key={dayPlan._id || dayPlan.id || dayIndex} className="animate-fade-in" style={{ animationDelay: `${dayIndex * 150}ms` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--color-primary)', padding: '0.5rem 1rem', borderRadius: '1rem', fontWeight: 600 }}>
                Day {dayIndex + 1}
              </div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontFamily: 'var(--font-sans)', fontWeight: 500 }}>
                {dayPlan.dayTitle.split(': ')[1] || dayPlan.dayTitle}
              </h3>
            </div>

            <div className="glass-panel" style={{ padding: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {dayPlan.items.map((item, itemIndex) => {
                const ItemIcon = icons[item.type] || Activity;
                return (
                  <div 
                    key={itemIndex}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '1.5rem', 
                      background: 'rgba(255, 255, 255, 0.03)', 
                      padding: '1.25rem', 
                      borderRadius: '0.75rem',
                      transition: 'transform 0.2s ease, background 0.2s ease',
                      cursor: 'grab'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
                  >
                    <div style={{ color: 'var(--color-text-muted)', cursor: 'grab' }}>
                      <GripVertical size={20} />
                    </div>
                    
                    <div style={{ width: '80px', flexShrink: 0 }}>
                      <span style={{ fontWeight: 600, color: 'var(--color-secondary)' }}>{item.time}</span>
                    </div>
                    
                    <div style={{ 
                      background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(6, 182, 212, 0.2))',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      flexShrink: 0
                    }}>
                      <ItemIcon size={18} />
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontFamily: 'var(--font-sans)', fontSize: '1.1rem', letterSpacing: 'normal', textTransform: 'none' }}>
                        {item.title}
                      </h4>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'capitalize', background: 'rgba(255,255,255,0.1)', padding: '0.1rem 0.5rem', borderRadius: '1rem' }}>
                          {item.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <button 
                className="btn" 
                style={{ 
                  marginTop: '0.5rem', 
                  width: '100%', 
                  border: '1px dashed rgba(255, 255, 255, 0.2)', 
                  color: 'var(--color-text-muted)',
                  background: 'transparent'
                }}
                onClick={() => {
                  const title = window.prompt("Enter activity title (e.g., 'Sunset Cruise at Mandovi River'):");
                  if (!title) return;
                  const time = window.prompt("Enter time (e.g., '07:30 PM'):", "07:30 PM");
                  if (!time) return;
                  const type = window.prompt("Enter type (lodging, food, activity, transport):", "activity");
                  if (!type) return;
                  if (!['lodging', 'food', 'activity', 'transport'].includes(type.toLowerCase())) {
                    alert("Invalid type! Must be: lodging, food, activity, or transport");
                    return;
                  }
                  
                  const token = localStorage.getItem('token');
                  fetch('/api/itineraries/activity', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                      dayId: dayPlan._id,
                      time,
                      title,
                      type: type.toLowerCase()
                    })
                  })
                  .then(res => {
                    if (!res.ok) throw new Error('Failed to add activity');
                    return res.json();
                  })
                  .then(updatedDay => {
                    setItinerary(itinerary.map(d => d._id === updatedDay._id ? updatedDay : d));
                  })
                  .catch(err => alert(err.message));
                }}
              >
                <Plus size={16} /> Add Activity
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Itinerary;
