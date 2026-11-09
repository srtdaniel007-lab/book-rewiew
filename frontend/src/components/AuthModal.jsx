import React, { useState } from 'react';
import { X, Lock, Mail, User, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [userId, setUserId] = useState('');
  const [gmail, setGmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      // 1. Validate Gmail format
      const trimmedGmail = gmail.trim().toLowerCase();
      if (!trimmedGmail.endsWith('@gmail.com')) {
        setError('Gmail must end with @gmail.com (e.g. reader@gmail.com)');
        return;
      }

      // 2. Validate Password length
      if (password.length < 8) {
        setError('Password must be at least 8 characters long');
        return;
      }

      // 3. Validate User ID
      if (userId.trim().length < 3) {
        setError('User ID must be at least 3 characters long');
        return;
      }

      setLoading(true);
      try {
        await register(userId.trim(), trimmedGmail, password);
        onClose();
      } catch (err) {
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    } else {
      // Login mode
      if (!gmail.trim() || !password) {
        setError('Please enter your Gmail / User ID and password');
        return;
      }
      setLoading(true);
      try {
        await login(gmail.trim(), password);
        onClose();
      } catch (err) {
        setError(err.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.8rem', color: '#0f172a' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Free Account'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '6px' }}>
            {mode === 'login' 
              ? 'Sign in to access your reading shelves, ratings & reviews' 
              : 'Join the community to track books, shelves & rate reads'}
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '20px' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'login' ? '#ffffff' : 'transparent',
              fontWeight: 600,
              color: mode === 'login' ? '#4f46e5' : '#64748b',
              boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'register' ? '#ffffff' : 'transparent',
              fontWeight: 600,
              color: mode === 'register' ? '#4f46e5' : '#64748b',
              boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              cursor: 'pointer'
            }}
          >
            Register New User
          </button>
        </div>

        {error && (
          <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label className="form-label">User ID / Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '38px' }}
                  placeholder="e.g. booklover99"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  required
                />
                <User size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
              </div>
              <div className="form-hint">At least 3 characters. Letters, numbers, and dashes.</div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              {mode === 'register' ? 'Gmail Address' : 'Gmail or User ID'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={mode === 'register' ? 'email' : 'text'}
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder={mode === 'register' ? 'yourname@gmail.com' : 'Enter Gmail or User ID'}
                value={gmail}
                onChange={(e) => setGmail(e.target.value)}
                required
              />
              <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
            {mode === 'register' && (
              <div className="form-hint">Must end with @gmail.com. We check for duplicates!</div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '38px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            </div>
            {mode === 'register' && (
              <div className="form-hint">Must be 8+ characters. Automatically hashed with bcrypt in PostgreSQL.</div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary-block"
            disabled={loading}
            style={{ marginTop: '20px' }}
          >
            {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

