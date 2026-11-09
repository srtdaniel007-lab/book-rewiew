// In production on Render, VITE_API_URL can be set to the backend service URL or host
// In local development, it defaults to empty string so it uses the Vite proxy (/api)
let baseApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
if (baseApiUrl && !baseApiUrl.startsWith('http://') && !baseApiUrl.startsWith('https://')) {
  baseApiUrl = `https://${baseApiUrl}`;
}
const API_BASE = baseApiUrl ? `${baseApiUrl}/api` : '/api';



// Helper for sending authenticated requests
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.detail || 'An unexpected error occurred';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth API
  register: (userData) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  }),

  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  getMe: () => request('/auth/me'),

  // Books API (Open Source Search)
  searchBooks: (query = 'fiction', maxResults = 24) => 
    request(`/books/search?q=${encodeURIComponent(query)}&max_results=${maxResults}`),

  getBookDetails: (bookId) => request(`/books/${encodeURIComponent(bookId)}`),

  // Shelves API
  getShelves: (status = null) => {
    const query = status ? `?status=${status}` : '';
    return request(`/shelves${query}`);
  },

  updateShelf: (shelfData) => request('/shelves', {
    method: 'POST',
    body: JSON.stringify(shelfData),
  }),

  removeFromShelf: (bookId) => request(`/shelves/${encodeURIComponent(bookId)}`, {
    method: 'DELETE',
  }),

  // Reviews API
  createReview: (reviewData) => request('/reviews', {
    method: 'POST',
    body: JSON.stringify(reviewData),
  }),

  getBookReviews: (bookId) => request(`/reviews/book/${encodeURIComponent(bookId)}`),

  getMyReviews: () => request('/reviews/my'),

  deleteReview: (reviewId) => request(`/reviews/${reviewId}`, {
    method: 'DELETE',
  }),

  // Live PostgreSQL Database Inspector
  getDatabaseTables: () => request('/database/tables'),
};

