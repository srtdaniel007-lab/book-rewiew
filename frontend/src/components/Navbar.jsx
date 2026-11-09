import React from 'react';
import { BookOpen, Bookmark, LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar-glass">
      <div className="container nav-container">
        {/* Brand Logo */}
        <div className="logo-badge" onClick={() => setActiveTab('discover')}>
          <div className="logo-icon-wrap" style={{ background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)' }}>
            <BookOpen size={24} />
          </div>
          <div>
            <span className="logo-title" style={{ fontFamily: 'var(--font-serif)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              The Muse's Shelf
            </span>
          </div>
        </div>

        {/* Center / Navigation Links */}
        <nav className="nav-links">
          <button
            className={`nav-btn ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <Sparkles size={17} />
            <span>Discover Books</span>
          </button>

          <button
            className={`nav-btn ${activeTab === 'shelves' ? 'active' : ''}`}
            onClick={() => {
              if (!user) {
                onOpenAuth('login');
              } else {
                setActiveTab('shelves');
              }
            }}
          >
            <Bookmark size={17} />
            <span>My Shelves & Reviews</span>
          </button>
        </nav>

        {/* Right Auth / Profile Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fef3c7', padding: '6px 14px', borderRadius: '9999px', border: '1px solid #fde68a' }}>
                <UserIcon size={16} color="#b45309" />
                <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#92400e' }}>
                  {user.user_id}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#b45309', opacity: 0.8 }}>
                  ({user.gmail})
                </span>
              </div>
              <button
                className="nav-btn"
                style={{ padding: '6px 12px', color: '#dc2626', background: '#fef2f2' }}
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              className="nav-btn nav-btn-primary"
              style={{ background: 'linear-gradient(135deg, #b45309 0%, #92400e 100%)' }}
              onClick={() => onOpenAuth('login')}
            >
              <LogIn size={17} />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
