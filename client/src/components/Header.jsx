import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plane, Compass, Map, Wallet, MessageSquare, LogOut, User as UserIcon, Calendar } from 'lucide-react';

const Header = ({ currentTab, setCurrentTab }) => {
  const { user, logout } = useContext(AuthContext);

  const navItems = [
    { id: 'explore', label: 'Explore', icon: Compass },
    { id: 'itinerary', label: 'Itinerary', icon: Calendar },
    { id: 'map', label: 'Travel Map', icon: Map },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'community', label: 'Community', icon: MessageSquare },
  ];

  return (
    <header className="glass-panel" style={{ margin: '1.5rem', borderRadius: '1rem', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '1.5rem', zIndex: 50 }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setCurrentTab('explore')}>
        <div style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', padding: '0.5rem', borderRadius: '0.75rem', color: 'white' }}>
          <Plane size={24} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--color-text)' }}>Wander<span className="text-gradient">Smart</span></h2>
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', gap: '1rem' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className="btn"
              style={{
                backgroundColor: isActive ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                padding: '0.5rem 1rem',
                borderRadius: '999px',
                transition: 'all 0.3s ease',
              }}
            >
              <Icon size={18} />
              <span style={{ fontWeight: isActive ? 600 : 400, fontSize: '0.95rem' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* User Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {user ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', padding: '0.5rem 1.25rem', borderRadius: '999px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <UserIcon size={16} className="text-primary" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text)' }}>{user.username}</span>
            </div>
            <button 
              onClick={() => { logout(); setCurrentTab('explore'); }} 
              className="btn btn-outline" 
              style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--color-text-muted)', display: 'flex', gap: '0.5rem' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </>
        ) : (
          <button 
            onClick={() => setCurrentTab('login')} 
            className="btn btn-primary" 
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
          >
            Sign In
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
