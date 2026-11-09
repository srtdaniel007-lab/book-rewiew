import React, { useState, useEffect } from 'react';
import { Bookmark, BookOpen, CheckCircle, Star, MessageSquareQuote, Trash2, Library } from 'lucide-react';
import { api } from '../api';
import BookCard from './BookCard';

export default function MyShelves({ onSelectBook }) {
  const [shelves, setShelves] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'want_to_read', 'reading', 'read', 'reviews'
  const [loading, setLoading] = useState(true);

  const fetchShelvesData = async () => {
    try {
      setLoading(true);
      const [shelvedBooks, myReviews] = await Promise.all([
        api.getShelves(),
        api.getMyReviews()
      ]);
      setShelves(shelvedBooks || []);
      setReviews(myReviews || []);
    } catch (err) {
      console.error('Error fetching shelves data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelvesData();
  }, []);

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteReview(reviewId);
      setReviews(reviews.filter((r) => r.id !== reviewId));
    } catch (err) {
      alert(err.message || 'Failed to delete review');
    }
  };

  const filteredBooks = shelves.filter((b) => {
    if (activeTab === 'all') return true;
    return b.status === activeTab;
  });

  const wantCount = shelves.filter((b) => b.status === 'want_to_read').length;
  const readingCount = shelves.filter((b) => b.status === 'reading').length;
  const readCount = shelves.filter((b) => b.status === 'read').length;

  return (
    <div style={{ paddingBottom: '60px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#0f172a', marginBottom: '8px' }}>
          My Personal Library & Shelves
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem' }}>
          Track books you want to read, what you're currently enjoying, books you have finished, and your reviews.
        </p>
      </div>

      {/* Tabs Bar */}
      <div className="shelves-tab-bar">
        <button
          className={`shelf-tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Library size={18} />
          <span>All Shelved ({shelves.length})</span>
        </button>

        <button
          className={`shelf-tab-item ${activeTab === 'want_to_read' ? 'active' : ''}`}
          onClick={() => setActiveTab('want_to_read')}
        >
          <Bookmark size={18} />
          <span>Want to Read ({wantCount})</span>
        </button>

        <button
          className={`shelf-tab-item ${activeTab === 'reading' ? 'active' : ''}`}
          onClick={() => setActiveTab('reading')}
        >
          <BookOpen size={18} />
          <span>Currently Reading ({readingCount})</span>
        </button>

        <button
          className={`shelf-tab-item ${activeTab === 'read' ? 'active' : ''}`}
          onClick={() => setActiveTab('read')}
        >
          <CheckCircle size={18} />
          <span>Read ({readCount})</span>
        </button>

        <button
          className={`shelf-tab-item ${activeTab === 'reviews' ? 'active' : ''}`}
          onClick={() => setActiveTab('reviews')}
        >
          <MessageSquareQuote size={18} />
          <span>My Written Reviews ({reviews.length})</span>
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
          Loading your personal shelf data from PostgreSQL...
        </div>
      ) : activeTab === 'reviews' ? (
        /* Reviews tab */
        <div>
          {reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <MessageSquareQuote size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#334155' }}>No reviews yet</h3>
              <p style={{ color: '#64748b', marginTop: '6px' }}>
                Search for any book on the Discover page, rate it, and submit your review!
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', gap: '14px', marginBottom: '12px' }}>
                    {rev.book_cover ? (
                      <img
                        src={rev.book_cover}
                        alt={rev.book_title}
                        style={{ width: '48px', height: '70px', objectFit: 'cover', borderRadius: '6px', boxShadow: 'var(--shadow-sm)' }}
                      />
                    ) : null}
                    <div>
                      <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.05rem', color: '#0f172a' }}>
                        {rev.book_title}
                      </h4>
                      <div className="star-rating-row" style={{ marginTop: '4px' }}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= rev.rating ? '#f59e0b' : 'none'}
                            stroke={s <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                          />
                        ))}
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', marginLeft: '4px' }}>
                          {rev.rating}/5
                        </span>
                      </div>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.5, flex: 1 }}>
                    "{rev.review_text}"
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => handleDeleteReview(rev.id)}
                      style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}
                      title="Delete review"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Books Shelf Grid */
        <div>
          {filteredBooks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <Bookmark size={40} color="#94a3b8" style={{ marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.2rem', color: '#334155' }}>
                No books in this shelf yet
              </h3>
              <p style={{ color: '#64748b', marginTop: '6px' }}>
                Explore bestsellers or search for titles on the Discover page to add them here!
              </p>
            </div>
          ) : (
            <div className="books-grid">
              {filteredBooks.map((shelfItem) => (
                <BookCard
                  key={shelfItem.book_id}
                  book={{
                    id: shelfItem.book_id,
                    title: shelfItem.title,
                    authors: [shelfItem.authors],
                    cover_image: shelfItem.cover_image,
                    description: shelfItem.description,
                  }}
                  userShelf={shelfItem}
                  onSelectBook={(b) => onSelectBook(b)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

