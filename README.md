# 📚 BookReads — Goodreads Clone (Full-Stack Web Application)

A full-stack, dynamic book review and tracking web application inspired by Goodreads. Powered by **Python FastAPI**, **PostgreSQL**, and **React**, with live open-source API book fetching (Google Books & Open Library), user authentication, shelving, ratings, and reviews.

---

## 📑 Table of Contents & Explanations

### 1. Website Explanation
BookReads is an interactive digital library platform where users can:
- **Discover & Search**: Look up millions of books by title, author, keyword, or genre via free open-source APIs with instant covers, descriptions, and ratings.
- **Personal Shelves**: Categorize books under **"Want to Read"**, **"Currently Reading"**, or **"Read"**.
- **Rate & Review**: Rate books with an interactive 1–5 star rating system and write detailed reviews/descriptions.
- **User Authentication**: Secure sign-up and login system requiring valid `@gmail.com` emails and 8+ character passwords, preventing duplicate registrations.
- **SQL Table Inspector**: A live in-app PostgreSQL inspector where you can see the database tables (`users`, `shelved_books`, `reviews`) updating in real-time.

---

### 2. Current Position & Knowledge in Coding
- **Foundations Applied**:
  - **Backend (Python)**: RESTful API design with FastAPI, asynchronous requests with `httpx`, dependency injection, ORM mapping with SQLAlchemy, and password security using Bcrypt hashing.
  - **Database (PostgreSQL)**: Relational schema design with primary keys, foreign keys, unique constraints, and ACID-compliant transactions.
  - **Frontend (React)**: State management (hooks, Context API), responsive CSS grid/flexbox layouts, interactive modals, and REST client integration with JWT Bearer tokens.
- **Learning Curve**:
  - This architecture follows enterprise full-stack standards: clean separation of concerns between client (React) and server (FastAPI), stateless JWT authentication, and secure password hashing.

---

### 3. Virtual Environment in Backend
A virtual environment isolates Python dependencies for this specific project without conflicting with other global packages on your system.

To create and activate it:
```powershell
# Navigate to backend
cd backend

# Create virtual environment named 'venv'
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Activate on Windows (Command Prompt)
venv\Scripts\activate.bat

# Install all requirements
pip install -r requirements.txt
```

---

### 4. Tech Stack
- **Backend**: **Python 3.14 + FastAPI**
  - High performance, automatic OpenAPI `/docs` documentation, Pydantic type validation.
- **Database**: **PostgreSQL 18**
  - Robust relational database for persistent storage of users, shelves, and reviews.
  - Connected via `SQLAlchemy 2.0` and `psycopg2-binary`.
- **Frontend**: **React 18 + Vite**
  - Ultra-fast development server, single-page application (SPA), styled with custom CSS and Lucide icons.
- **Open-Source APIs**:
  - Google Books API & Open Library API (no API key required, 100% free).

---

### 5. PostgreSQL Database Details
- **Engine**: PostgreSQL 18
- **Port Number**: `5432`
- **Host**: `localhost` (127.0.0.1)
- **Database Name**: `book_review`
- **Username**: `postgres`
- **Password**: `root`
- **Connection URL**: `postgresql+psycopg2://postgres:root@localhost:5432/book_review`

#### Database Tables Structure:
1. **`users` Table**:
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (VARCHAR(60) UNIQUE)
   - `gmail` (VARCHAR(120) UNIQUE, ends in `@gmail.com`)
   - `password_hash` (VARCHAR(255), hashed via Bcrypt)
   - `created_at` (TIMESTAMP)
2. **`shelved_books` Table**:
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (INTEGER REFERENCES users(id))
   - `book_id` (VARCHAR(100))
   - `title`, `authors`, `cover_image`, `description`
   - `status` ('want_to_read', 'reading', 'read')
   - `user_rating` (INTEGER 1-5)
   - `updated_at` (TIMESTAMP)
3. **`reviews` Table**:
   - `id` (SERIAL PRIMARY KEY)
   - `user_id` (INTEGER REFERENCES users(id))
   - `book_id` (VARCHAR(100))
   - `book_title`, `book_cover`
   - `rating` (INTEGER 1-5)
   - `review_text` (TEXT)
   - `created_at` (TIMESTAMP)

---

### 6. Structured Folders & Files Explanation
```
c:\Users\dani007\book review\
├── backend/
│   ├── venv/                      # Python virtual environment
│   ├── app/
│   │   ├── __init__.py            # Python package initializer
│   │   ├── config.py              # Central settings & DB connection string
│   │   ├── database.py            # SQLAlchemy engine, session maker, get_db
│   │   ├── models.py              # PostgreSQL table models (User, ShelvedBook, Review)
│   │   ├── schemas.py             # Pydantic validation schemas (@gmail.com, 8+ char pass)
│   │   ├── auth.py                # Bcrypt password hashing & JWT token verification
│   │   └── routers/
│   │       ├── auth_routes.py     # Registration, login, profile routes
│   │       ├── book_routes.py     # Google Books / Open Library search & details
│   │       ├── user_routes.py     # Shelves, status updates, rating & reviews
│   │       └── admin_routes.py    # Live SQL table inspector for PostgreSQL
│   ├── requirements.txt           # Python package dependencies
│   ├── run.py                     # Convenience startup script (uvicorn)
│   └── tests/
│       └── test_api.py            # Backend test suite (100% passing)
├── frontend/
│   ├── package.json               # Node.js dependencies & scripts
│   ├── vite.config.js             # Vite build & backend proxy config
│   ├── index.html                 # Main HTML root
│   └── src/
│       ├── main.jsx               # Application entry point
│       ├── App.jsx                # Main page controller & layouts
│       ├── index.css              # Custom editorial theme & responsive CSS
│       ├── api.js                 # API communication layer
│       ├── context/
│       │   └── AuthContext.jsx    # User login/logout global state
│       └── components/
│           ├── Navbar.jsx         # Navigation bar with brand & status
│           ├── BookCard.jsx       # Individual book card with cover & badges
│           ├── BookDetailModal.jsx# Shelf selection, star rating & review modal
│           ├── MyShelves.jsx      # Personal library tabs (Want to Read / Reading / Read)
│           ├── AuthModal.jsx      # Register/Login modal with validations
│           └── DatabaseViewerModal.jsx # Live PostgreSQL tables viewer
├── start.bat                      # One-click dual server launcher
└── README.md                      # Documentation
```

---

### 7. The Beauty of the Website
- **Modern Editorial Aesthetic**: Combines classic literary typography (*Playfair Display*) with clean, accessible sans-serif (*Plus Jakarta Sans*).
- **Physical Book Feel**: Card elements feature dimensional shadows (`--shadow-book`), 3D hover elevations, and spine borders that mirror holding a real physical book.
- **Dynamic & Responsive**: Live keyword search with instant debounced queries, dynamic shelf filtering, seamless star interactions, and real-time review updates without page reloads.
- **Glassmorphic Navigation**: Frosted header (`backdrop-filter: blur(12px)`) that stays pinned gracefully as users scroll through book covers.
- **Transparency & Developer Ergonomics**: Includes an integrated **SQL Database Inspector** button in the header so you can watch your data enter PostgreSQL live.

---

## 🚀 How to Run the Website

### Option 1: One-Click Launch
Double-click `start.bat` in the root folder. It starts both the FastAPI backend and React frontend in separate windows.

### Option 2: Manual Terminal Commands
#### Terminal 1 — Backend:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python run.py
```
*Backend runs on: `http://127.0.0.1:8001` (Interactive API docs at `http://127.0.0.1:8001/docs`)*

#### Terminal 2 — Frontend:
```powershell
cd frontend
npm run dev
```
*Frontend runs on: `http://localhost:5173`*

