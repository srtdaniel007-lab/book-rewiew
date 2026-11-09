import React from 'react';
import { BookOpen, Bookmark, Database, LogIn, LogOut, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenAuth, onOpenDbModal }) {
  const { user, logout } = useAuth();

  return (
    <header className="navbar-glass">
      <div className="container nav-container">
        {/* Brand Logo */}
        <div className="logo-badge" onClick={() => setActiveTab('discover')}>
          <div className="logo-icon-wrap">
            <BookOpen size={24} />
          </div>
          <div>
            <span className="logo-title">BookReads</span>
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

          <button
            className="nav-btn"
            style={{ color: '#0d9488', background: '#f0fdfa', borderColor: '#ccfbf1' }}
            onClick={onOpenDbModal}
            title="Inspect PostgreSQL tables (users, shelves, reviews)"
          >
            <Database size={17} />
            <span>SQL Database</span>
          </button>
        </nav>

        {/* Right Auth / Profile Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '9999px' }}>
                <UserIcon size={16} color="#4f46e5" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1e293b' }}>
                  {user.user_id}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  ({user.gmail})
                </span>
              </div>
              <button
                className="nav-btn"
                style={{ padding: '6px 10px', color: '#dc2626', background: '#fef2f2' }}
                onClick={logout}
                title="Log Out"
              >
                <LogOut size={16} />
                <span>Exit</span>
              </button>
            </div>
          ) : (
            <button
              className="nav-btn nav-btn-primary"
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

