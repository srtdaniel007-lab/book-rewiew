import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, Bookmark, Star, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';
import MyShelves from './components/MyShelves';
import AuthModal from './components/AuthModal';
import LiteraryQuote from './components/LiteraryQuote';
import { api } from './api';
import { useAuth } from './context/AuthContext';

const QUICK_TOPICS = [
  'Bestsellers',
  'Fiction',
  'Classic Literature',
  'Philosophy',
  'Science Fiction',
  'Psychology',
  'Poetry',
  'Mystery',
  'Fantasy'
];

export default function App() {
  const { user } = useAuth();
  const [activeNav, setActiveNav] = useState('discover'); // 'discover' or 'shelves'
  const [searchQuery, setSearchQuery] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Shelves dictionary for quick status mapping: { [book_id]: shelfItem }
  const [shelvesMap, setShelvesMap] = useState({});

  // Modals
  const [selectedBook, setSelectedBook] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  // Initial load
  useEffect(() => {
    handleSearch('bestseller books');
  }, []);

  // Sync shelves live from PostgreSQL whenever user signs in or out
  useEffect(() => {
    if (user) {
      loadUserShelves();
    } else {
      setShelvesMap({});
    }
  }, [user]);

  const loadUserShelves = async () => {
    try {
      const data = await api.getShelves();
      const map = {};
      data.forEach((item) => {
        map[item.book_id] = item;
      });
      setShelvesMap(map);
    } catch (e) {
      console.error('Failed to load shelves map from PostgreSQL', e);
    }
  };

  const handleSearch = async (term) => {
    const query = term !== undefined ? term : searchQuery;
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    try {
      const results = await api.searchBooks(query);
      setBooks(results);
    } catch (err) {
      setError(err.message || 'Failed to fetch books from open API');
    } finally {
      setLoading(false);
    }
  };

  const handleShelfChange = (shelfEvent) => {
    setShelvesMap((prev) => {
      const copy = { ...prev };
      if (shelfEvent.removed) {
        delete copy[shelfEvent.book_id];
      } else {
        copy[shelfEvent.book_id] = shelfEvent;
      }
      return copy;
    });
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        activeTab={activeNav}
        setActiveTab={setActiveNav}
        onOpenAuth={openAuth}
      />

      <main className="container" style={{ flex: 1, paddingTop: '20px' }}>
        {activeNav === 'discover' ? (
          <div>
            {/* Hero / Search Section */}
            <section className="hero-banner">
              {/* Random Literary Quote Banner */}
              <LiteraryQuote />

              <div className="hero-pill" style={{ background: '#fef3c7', color: '#b45309' }}>
                <Sparkles size={14} /> The Literary Sanctuary
              </div>
              <h1 className="hero-heading" style={{ fontFamily: 'var(--font-serif)', fontSize: '3.2rem', letterSpacing: '-0.02em' }}>
                THE MUSE'S <span style={{ color: '#b45309', fontStyle: 'italic' }}>SHELF</span>
              </h1>
              <p className="hero-subtitle">
                Explore thousands of books, catalog your personal reading journey, rate your reads, 
                and preserve your written reviews safely in your library.
              </p>

              {/* Dynamic Search Box */}
              <div className="search-bar-wrap">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                  }}
                  className="search-input-box"
                >
                  <Search size={22} color="#b45309" style={{ marginLeft: '6px' }} />
                  <input
                    type="text"
                    placeholder="Search by title, author, topic, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-submit-btn" style={{ background: '#b45309' }}>
                    <span>Search</span>
                  </button>
                </form>

                {/* Quick Topic Chips */}
                <div className="quick-topics">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      className="quick-topic-chip"
                      onClick={() => {
                        setSearchQuery(topic);
                        handleSearch(topic);
                      }}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Results Header */}
            <div className="section-header">
              <div>
                <h2 className="section-title">
                  {searchQuery ? `Results for "${searchQuery}"` : 'Curated & Trending Reads'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Click any book to shelf under "Want to Read", "Reading", or "Read", and pen your review.
                </p>
              </div>
            </div>

            {error && (
              <div className="error-banner">
                {error}
              </div>
            )}

            {/* Books Grid */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#b45309' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Gathering books from Open Literary Sources...</div>
              </div>
            ) : books.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                No books found. Try searching for a different title or author!
              </div>
            ) : (
              <div className="books-grid">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    userShelf={shelvesMap[book.id]}
                    onSelectBook={(b) => setSelectedBook(b)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* My Shelves & Personal Library View */
          <MyShelves
            onSelectBook={(book) => setSelectedBook(book)}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #e2e8f0', background: '#ffffff', padding: '28px 0', marginTop: 'auto' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', fontSize: '0.88rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="#b45309" />
            <span style={{ fontWeight: 700, color: '#1e293b' }}>The Muse's Shelf</span>
            <span>— Your personal digital sanctuary for books & reviews</span>
          </div>
          <div style={{ color: '#94a3b8' }}>
            FastAPI • PostgreSQL • React
          </div>
        </div>
      </footer>

      {/* Book Detail & Review Modal */}
      {selectedBook && (
        <BookDetailModal
          book={selectedBook}
          currentShelf={shelvesMap[selectedBook.id]}
          onClose={() => setSelectedBook(null)}
          onShelfChange={handleShelfChange}
          onOpenAuth={openAuth}
        />
      )}

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
