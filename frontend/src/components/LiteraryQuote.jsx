import React, { useState, useEffect } from 'react';
import { Quote, RefreshCw, Feather } from 'lucide-react';

const LITERARY_QUOTES = [
  {
    quote: "A reader lives a thousand lives before he dies. The man who never reads lives only one.",
    author: "George R.R. Martin"
  },
  {
    quote: "I have always imagined that Paradise will be a kind of a library.",
    author: "Jorge Luis Borges"
  },
  {
    quote: "There is no friend as loyal as a book.",
    author: "Ernest Hemingway"
  },
  {
    quote: "You can never get a cup of tea large enough or a book long enough to suit me.",
    author: "C.S. Lewis"
  },
  {
    quote: "Books are a uniquely portable magic.",
    author: "Stephen King"
  },
  {
    quote: "If you only read the books that everyone else is reading, you can only think what everyone else is thinking.",
    author: "Haruki Murakami"
  },
  {
    quote: "It is what you read when you don't have to that determines what you will be when you can't help it.",
    author: "Oscar Wilde"
  },
  {
    quote: "A room without books is like a body without a soul.",
    author: "Cicero"
  },
  {
    quote: "We read to know we're not alone.",
    author: "William Nicholson"
  },
  {
    quote: "One must always be careful of books, and what is inside them, for words have the power to change us.",
    author: "Cassandra Clare"
  },
  {
    quote: "I declare after all there is no enjoyment like reading! How much sooner one tires of any thing than of a book!",
    author: "Jane Austen, Pride and Prejudice"
  },
  {
    quote: "Some books leave us free and some books make us free.",
    author: "Ralph Waldo Emerson"
  }
];

export default function LiteraryQuote() {
  const [currentQuote, setCurrentQuote] = useState(
    LITERARY_QUOTES[Math.floor(Math.random() * LITERARY_QUOTES.length)]
  );
  const [loading, setLoading] = useState(false);

  const fetchRandomQuote = async () => {
    setLoading(true);
    try {
      // Fetch from free open quote API with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch("https://dummyjson.com/quotes/random", {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        setCurrentQuote({
          quote: data.quote,
          author: data.author
        });
        setLoading(false);
        return;
      }
    } catch (e) {
      // Fallback seamlessly to curated literary quotes
    }

    // Fallback to random literary quote
    const next = LITERARY_QUOTES[Math.floor(Math.random() * LITERARY_QUOTES.length)];
    setCurrentQuote(next);
    setLoading(false);
  };

  useEffect(() => {
    fetchRandomQuote();
  }, []);

  return (
    <div
      style={{
        maxWidth: '780px',
        margin: '0 auto 28px auto',
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1px solid #fde68a',
        borderRadius: '16px',
        padding: '18px 24px',
        position: 'relative',
        boxShadow: '0 4px 14px -2px rgba(180, 83, 9, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#b45309', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '6px' }}>
        <Feather size={14} />
        <span>Literary Muse of the Day</span>
      </div>

      <p style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: '1.15rem', color: '#78350f', lineHeight: 1.5, margin: '6px 0 10px 0', maxWidth: '680px' }}>
        "{currentQuote.quote}"
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '680px', paddingTop: '6px' }}>
        <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#92400e' }}>
          — {currentQuote.author}
        </span>

        <button
          onClick={fetchRandomQuote}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#b45309',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 8px',
            borderRadius: '6px',
            transition: 'opacity 0.2s'
          }}
          title="Shuffle another quote"
          disabled={loading}
        >
          <RefreshCw size={13} className={loading ? 'spin' : ''} />
          <span>New Quote</span>
        </button>
      </div>
    </div>
  );
}
