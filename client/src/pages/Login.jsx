import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Plane, Mail, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const Login = ({ onAuthSuccess }) => {
  const { login, register } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!username || !email || !password) {
          throw new Error('All fields are required');
        }
        await register(username, email, password);
      } else {
        if (!email || !password) {
          throw new Error('Email and password are required');
        }
        await login(email, password);
      }
      if (onAuthSuccess) onAuthSuccess();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', width: '100%', padding: '1rem' }} className="animate-fade-in">
      <div className="glass-panel" style={{ maxWidth: '450px', width: '100%', padding: '3rem 2.5rem', borderRadius: '1.5rem', textAlign: 'center' }}>
        
        {/* Logo Icon */}
        <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', padding: '1rem', borderRadius: '1rem', color: 'white', marginBottom: '1.5rem' }}>
          <Plane size={32} />
        </div>

        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.25rem', marginBottom: '0.5rem' }}>
          {isRegister ? 'Create ' : 'Sign In to '}<span className="text-gradient">WanderSmart</span>
        </h2>
        <p className="text-muted" style={{ marginBottom: '2.5rem', fontSize: '0.95rem' }}>
          {isRegister ? 'Start planning your dream adventure today' : 'Your personal smart travel companion'}
        </p>

        {error && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--color-danger)', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem', textAlign: 'left', fontSize: '0.9rem' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', textAlign: 'left' }}>
          
          {isRegister && (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={18} className="text-muted" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="traveler_jane" 
                  className="input-field" 
                  style={{ paddingLeft: '3rem', borderRadius: '1rem' }}
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} className="text-muted" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jane@example.com" 
                className="input-field" 
                style={{ paddingLeft: '3rem', borderRadius: '1rem' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.5rem', color: 'var(--color-text-muted)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} className="text-muted" style={{ position: 'absolute', left: '1.25rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="input-field" 
                style={{ paddingLeft: '3rem', borderRadius: '1rem' }}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '1rem', borderRadius: '1rem', padding: '1rem', fontSize: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Processing...' : (isRegister ? 'Sign Up' : 'Sign In')}
            {!loading && <ArrowRight size={18} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </form>

        <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
          <button 
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            style={{ color: 'var(--color-primary)', fontWeight: 600, borderBottom: '1px dashed var(--color-primary)' }}
          >
            {isRegister ? 'Sign In' : 'Sign Up Free'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Login;
