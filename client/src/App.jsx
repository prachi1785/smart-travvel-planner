import React, { useState, useEffect, useContext } from 'react';
import Header from './components/Header';
import DestinationSearch from './components/DestinationSearch';
import Itinerary from './components/Itinerary';
import Budget from './components/Budget';
import Reviews from './components/Reviews';
import TravelMap from './components/TravelMap';
import ChatWidget from './components/ChatWidget';
import Login from './pages/Login';
import { AuthContext } from './context/AuthContext';
import './index.css';

function App() {
  const [currentTab, setCurrentTab] = useState('explore');
  const { user, token, loading } = useContext(AuthContext);

  // Protect tabs
  const protectedTabs = ['itinerary', 'map', 'budget', 'community'];
  useEffect(() => {
    if (protectedTabs.includes(currentTab) && !token && !loading) {
      setCurrentTab('login');
    }
  }, [currentTab, token, loading]);

  const handleSelectDestination = async (dest) => {
    const activeToken = token || localStorage.getItem('token');
    if (!activeToken) {
      setCurrentTab('login');
      return;
    }

    const daysStr = window.prompt(`How many days is your trip to ${dest.name}? (Enter 1-15)`, "3");
    if (daysStr === null) return;
    const numberOfDays = parseInt(daysStr);
    if (isNaN(numberOfDays) || numberOfDays <= 0 || numberOfDays > 15) {
      alert("Please enter a valid number of days between 1 and 15.");
      return;
    }

    const budgetStyle = window.prompt("Enter your budget style (options: Backpacker, Mid-range, Luxury):", "Mid-range");
    if (budgetStyle === null) return;
    const styleClean = budgetStyle.trim() || 'Mid-range';

    const budgetLimitStr = window.prompt("Enter your total trip budget in ₹:", "25000");
    if (budgetLimitStr === null) return;
    const totalBudget = parseFloat(budgetLimitStr);
    if (isNaN(totalBudget) || totalBudget <= 0) {
      alert("Please enter a valid budget amount.");
      return;
    }

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ 
          destination: dest.name,
          numberOfDays,
          totalBudget,
          budgetStyle: styleClean
        })
      });
      if (res.ok) {
        setCurrentTab('itinerary');
      } else {
        console.error('Failed to create trip');
      }
    } catch (err) {
      console.error('Error creating trip:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'var(--color-bg)', color: 'white' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 500 }}>Loading WanderSmart...</div>
      </div>
    );
  }

  return (
    <div className="app-wrapper animate-fade-in">
      <Header currentTab={currentTab} setCurrentTab={setCurrentTab} />
      
      <main className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
        {currentTab === 'login' && (
          <Login onAuthSuccess={() => setCurrentTab('explore')} />
        )}

        {currentTab === 'explore' && (
          <div className="animate-fade-in text-center" style={{ marginTop: '4rem' }}>
            <h1 style={{ fontSize: '4rem', marginBottom: '1rem', lineHeight: 1.1 }}>Find Your Next <br/><span className="text-gradient">Indian Adventure</span></h1>
            <p className="text-muted" style={{ fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
              Plan, budget, and share your journey across India and beyond with the smartest travel companion.
            </p>
            <DestinationSearch onSelectDestination={handleSelectDestination} />
          </div>
        )}
        
        {currentTab === 'itinerary' && token && (
          <div className="animate-fade-in">
            <Itinerary />
          </div>
        )}
        
        {currentTab === 'budget' && token && (
          <div className="animate-fade-in">
            <Budget />
          </div>
        )}
        
        {currentTab === 'map' && token && (
          <div className="animate-fade-in">
            <TravelMap onSelectDestination={handleSelectDestination} />
          </div>
        )}
        
        {currentTab === 'community' && token && (
          <div className="animate-fade-in">
            <Reviews />
          </div>
        )}
      </main>

      {token && <ChatWidget />}
    </div>
  );
}

export default App;
