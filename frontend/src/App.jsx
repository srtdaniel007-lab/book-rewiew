import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, Bookmark, Star, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar';
import BookCard from './components/BookCard';
import BookDetailModal from './components/BookDetailModal';
import MyShelves from './components/MyShelves';
import AuthModal from './components/AuthModal';
import DatabaseViewerModal from './components/DatabaseViewerModal';
import { api } from './api';
import { useAuth } from './context/AuthContext';

const QUICK_TOPICS = [
  'Bestsellers',
  'Fiction',
  'Science Fiction',
  'Psychology',
  'Self-Help',
  'Mystery',
  'Philosophy',
  'Fantasy',
  'Technology'
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
  const [dbModalOpen, setDbModalOpen] = useState(false);

  // Initial load
  useEffect(() => {
    handleSearch('bestseller books');
  }, []);

  // Sync shelves when user logs in/out
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
      console.error('Failed to load shelves map', e);
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
        onOpenDbModal={() => setDbModalOpen(true)}
      />

      <main className="container" style={{ flex: 1, paddingTop: '20px' }}>
        {activeNav === 'discover' ? (
          <div>
            {/* Hero / Search Section */}
            <section className="hero-banner">
              <div className="hero-pill">
                <Sparkles size={14} /> Open Book Discovery & Reviews
              </div>
              <h1 className="hero-heading">
                Read, Track & <span>Review Books</span>
              </h1>
              <p className="hero-subtitle">
                A Goodreads clone powered by free open-source APIs & PostgreSQL.
                Search thousands of books, label them to your shelf, rate & publish your reviews.
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
                  <Search size={22} color="#6366f1" style={{ marginLeft: '6px' }} />
                  <input
                    type="text"
                    placeholder="Search by title, author, topic, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="search-submit-btn">
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
                  {searchQuery ? `Results for "${searchQuery}"` : 'Recommended & Trending Books'}
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                  Click any book to shelf as "Want to Read", "Reading", or "Read", and write reviews.
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
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#6366f1' }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 600 }}>Fetching books from Open Library & Google Books API...</div>
              </div>
            ) : books.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                No books found. Try another search query!
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
            <BookOpen size={18} color="#4f46e5" />
            <span style={{ fontWeight: 700, color: '#1e293b' }}>BookReads</span>
            <span>— Open Source Book Review & Shelving Platform</span>
          </div>
          <div>
            FastAPI • PostgreSQL • React • Bcrypt Auth
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

      {/* Live PostgreSQL Database Viewer Modal */}
      <DatabaseViewerModal
        isOpen={dbModalOpen}
        onClose={() => setDbModalOpen(false)}
      />
    </div>
  );
}

