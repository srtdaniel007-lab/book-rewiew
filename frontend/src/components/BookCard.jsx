import React from 'react';
import { Star, BookOpen, Check, Bookmark } from 'lucide-react';

export default function BookCard({ book, userShelf, onSelectBook }) {
  const authorsText = Array.isArray(book.authors) 
    ? book.authors.join(', ') 
    : (book.authors || 'Unknown Author');

  const shelfStatus = userShelf ? userShelf.status : null;
  const userRating = userShelf ? userShelf.user_rating : null;

  return (
    <div className="book-card" onClick={() => onSelectBook(book)}>
      <div className="book-cover-wrap">
        {book.cover_image ? (
          <img
            src={book.cover_image}
            alt={book.title}
            className="book-cover-img"
            loading="lazy"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div
          className="book-cover-placeholder"
          style={{ display: book.cover_image ? 'none' : 'flex' }}
        >
          <BookOpen size={32} style={{ marginBottom: '8px', opacity: 0.6 }} />
          <span>{book.title}</span>
        </div>
      </div>

      <h3 className="book-card-title" title={book.title}>
        {book.title}
      </h3>
      <p className="book-card-author">{authorsText}</p>

      <div className="book-meta-row">
        <div className="rating-badge">
          <Star size={15} fill="#f59e0b" stroke="#f59e0b" />
          <span>
            {userRating 
              ? `${userRating}.0 (You)` 
              : book.average_rating 
                ? Number(book.average_rating).toFixed(1) 
                : 'New'}
          </span>
        </div>

        {shelfStatus ? (
          <span className={`shelf-tag shelf-${shelfStatus}`}>
            {shelfStatus === 'want_to_read' && 'Want to Read'}
            {shelfStatus === 'reading' && 'Reading'}
            {shelfStatus === 'read' && 'Read'}
          </span>
        ) : (
          <span style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Bookmark size={13} /> View
          </span>
        )}
      </div>
    </div>
  );
}

