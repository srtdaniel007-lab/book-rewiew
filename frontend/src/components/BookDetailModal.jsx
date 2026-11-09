import React, { useState, useEffect } from 'react';
import { X, Star, Bookmark, Check, Trash2, Send, MessageSquareQuote, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function BookDetailModal({ book, currentShelf, onClose, onShelfChange, onOpenAuth }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  
  // Review form
  const [newRating, setNewRating] = useState(currentShelf?.user_rating || 5);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  // Selected shelf status
  const [activeShelf, setActiveShelf] = useState(currentShelf?.status || '');
  const [updatingShelf, setUpdatingShelf] = useState(false);

  useEffect(() => {
    if (!book) return;
    loadBookReviews();
  }, [book]);

  const loadBookReviews = async () => {
    try {
      setReviewLoading(true);
      const data = await api.getBookReviews(book.id);
      setReviews(data || []);
    } catch (e) {
      console.error('Failed to load reviews', e);
    } finally {
      setReviewLoading(false);
    }
  };

  if (!book) return null;

  const authorsText = Array.isArray(book.authors) 
    ? book.authors.join(', ') 
    : (book.authors || 'Unknown Author');

  const handleShelfSelect = async (shelfType) => {
    if (!user) {
      onOpenAuth('login');
      return;
    }
    try {
      setUpdatingShelf(true);
      const res = await api.updateShelf({
        book_id: book.id,
        title: book.title,
        authors: authorsText,
        cover_image: book.cover_image || '',
        description: book.description || '',
        status: shelfType,
        user_rating: newRating || null,
      });
      setActiveShelf(shelfType);
      onShelfChange(res);
      setFeedbackMsg(`Book added to "${shelfType.replace(/_/g, ' ')}" shelf!`);
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to update shelf');
    } finally {
      setUpdatingShelf(false);
    }
  };

  const handleRemoveShelf = async () => {
    if (!user) return;
    try {
      setUpdatingShelf(true);
      await api.removeFromShelf(book.id);
      setActiveShelf('');
      onShelfChange({ book_id: book.id, removed: true });
      setFeedbackMsg('Removed from your shelves');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to remove from shelf');
    } finally {
      setUpdatingShelf(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth('login');
      return;
    }
    if (!reviewText.trim()) return;

    try {
      setSubmittingReview(true);
      const newRev = await api.createReview({
        book_id: book.id,
        book_title: book.title,
        book_cover: book.cover_image || '',
        rating: newRating,
        review_text: reviewText.trim()
      });
      setReviews([newRev, ...reviews]);
      setReviewText('');
      setActiveShelf('read');
      onShelfChange({
        book_id: book.id,
        status: 'read',
        user_rating: newRating,
        title: book.title,
        authors: authorsText,
        cover_image: book.cover_image
      });
      setFeedbackMsg('Review published & saved to PostgreSQL!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {feedbackMsg && (
          <div className="success-banner" style={{ marginBottom: '16px' }}>
            {feedbackMsg}
          </div>
        )}

        {/* Book Header Layout */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '24px' }}>
          {/* Book Cover */}
          <div style={{ width: '160px', flexShrink: 0 }}>
            <div className="book-cover-wrap" style={{ margin: 0 }}>
              {book.cover_image ? (
                <img src={book.cover_image} alt={book.title} className="book-cover-img" />
              ) : (
                <div className="book-cover-placeholder">No Cover</div>
              )}
            </div>

            {/* Quick Shelf Selection Pill Buttons */}
            <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <button
                type="button"
                className={`nav-btn ${activeShelf === 'want_to_read' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '7px' }}
                onClick={() => handleShelfSelect('want_to_read')}
                disabled={updatingShelf}
              >
                <Bookmark size={14} />
                <span>Want to Read</span>
              </button>

              <button
                type="button"
                className={`nav-btn ${activeShelf === 'reading' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '7px' }}
                onClick={() => handleShelfSelect('reading')}
                disabled={updatingShelf}
              >
                <Check size={14} />
                <span>Reading</span>
              </button>

              <button
                type="button"
                className={`nav-btn ${activeShelf === 'read' ? 'active' : ''}`}
                style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '7px' }}
                onClick={() => handleShelfSelect('read')}
                disabled={updatingShelf}
              >
                <Check size={14} />
                <span>Read</span>
              </button>

              {activeShelf && (
                <button
                  type="button"
                  style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', marginTop: '4px' }}
                  onClick={handleRemoveShelf}
                >
                  <Trash2 size={12} /> Remove from shelves
                </button>
              )}
            </div>
          </div>

          {/* Book Info Column */}
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.75rem', lineHeight: 1.2, color: '#0f172a', marginBottom: '6px' }}>
              {book.title}
            </h2>
            <p style={{ fontSize: '1.05rem', color: '#475569', fontWeight: 500, marginBottom: '14px' }}>
              by <span style={{ color: '#4338ca', fontWeight: 600 }}>{authorsText}</span>
            </p>

            {/* Badges row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
              {book.average_rating && (
                <div className="rating-badge" style={{ fontSize: '0.95rem' }}>
                  <Star size={18} fill="#f59e0b" stroke="#f59e0b" />
                  <span>{book.average_rating} ({book.ratings_count || 'open'} reviews)</span>
                </div>
              )}
              {book.published_year && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                  <Calendar size={15} />
                  <span>{book.published_year}</span>
                </div>
              )}
              {book.categories && book.categories.length > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: '#64748b' }}>
                  <Tag size={15} />
                  <span>{book.categories.slice(0, 2).join(', ')}</span>
                </div>
              )}
            </div>

            {/* Summary / Description */}
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.88rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px' }}>
                Summary & Description
              </h4>
              <p style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
                {book.description || 'No detailed summary provided by open API for this title.'}
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '24px 0' }} />

        {/* Write a Review Section */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.3rem', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquareQuote size={20} color="#4f46e5" />
            <span>Rate & Review this Book</span>
          </h3>

          {!user ? (
            <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
              <p style={{ color: '#475569', fontSize: '0.95rem', marginBottom: '10px' }}>
                Sign in with your Gmail to rate and leave a review.
              </p>
              <button className="nav-btn nav-btn-primary" onClick={() => onOpenAuth('login')}>
                Sign In to Review
              </button>
            </div>
          ) : (
            <form onSubmit={handleAddReview} style={{ background: '#fafaf9', padding: '18px', borderRadius: '14px', border: '1px solid #e7e5e4' }}>
              {/* Star selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>Your Rating:</span>
                <div className="star-rating-row">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={24}
                      className="star-interactive"
                      fill={star <= newRating ? '#f59e0b' : 'none'}
                      stroke={star <= newRating ? '#f59e0b' : '#cbd5e1'}
                      onClick={() => setNewRating(star)}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#b45309' }}>
                  {newRating} / 5 Stars
                </span>
              </div>

              {/* Review Text */}
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Write your thoughts, rating notes, or review description..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  className="search-submit-btn"
                  disabled={submittingReview}
                  style={{ borderRadius: '8px', padding: '8px 18px' }}
                >
                  <Send size={15} />
                  <span>{submittingReview ? 'Publishing...' : 'Submit Review'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Community Reviews List */}
        <div>
          <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: '#0f172a', marginBottom: '14px' }}>
            Community Reviews ({reviews.length})
          </h4>

          {reviewLoading ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', fontStyle: 'italic' }}>
              No reviews yet. Be the first reader to write a review!
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '14px 18px',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, color: '#1e293b', fontSize: '0.92rem' }}>
                        {rev.author_name}
                      </span>
                      {rev.author_gmail && (
                        <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                          ({rev.author_gmail})
                        </span>
                      )}
                    </div>
                    <div className="star-rating-row">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          fill={star <= rev.rating ? '#f59e0b' : 'none'}
                          stroke={star <= rev.rating ? '#f59e0b' : '#cbd5e1'}
                        />
                      ))}
                    </div>
                  </div>
                  <p style={{ color: '#334155', fontSize: '0.9rem', lineHeight: 1.5 }}>
                    {rev.review_text}
                  </p>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px' }}>
                    {new Date(rev.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

