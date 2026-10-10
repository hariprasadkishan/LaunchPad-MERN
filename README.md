# LaunchPad

AI-powered startup idea validation platform. Submit your startup concept and receive an instant report with market analysis, competitive insights, and a viability score.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router |
| Backend | Node.js 22, Express 5, Mongoose 9 |
| Database | MongoDB 7 |
| Auth | JWT (bcryptjs) |

---

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string

---

## Setup

### 1. Clone and enter the project

```bash
git clone <repo-url>
cd nEWWWW
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
# Edit .env and set MONGO_URI and JWT_SECRET
```

### 3. Install dependencies

```bash
# From project root
cd server && npm install
cd ../client && npm install
```

---

## Running the app

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd server
npm run dev        # nodemon, restarts on changes
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev        # Vite dev server
# Runs on http://localhost:3000
```

The Vite dev server proxies `/api/*` requests to `localhost:5000` automatically — no CORS issues during development.

---

## API

### Health check

```
GET /api/health
→ { "status": "ok", "message": "LaunchPad API is running" }
```

More routes will be added in subsequent phases (auth, ideas, AI validation).

---

## Project Structure

```
nEWWWW/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/   # Reusable UI
│       ├── pages/        # Route-level components
│       ├── context/      # AuthContext
│       ├── hooks/        # Custom hooks
│       └── services/     # Axios API layer
└── server/          # Express backend
    ├── config/       # DB connection
    ├── controllers/  # Route handlers
    ├── middleware/   # Auth, error handling
    ├── models/       # Mongoose schemas
    ├── routes/       # Express routers
    └── services/     # AI integration
```

---

## Roadmap

- [x] Phase 1 — Project scaffolding
- [ ] Phase 2 — Auth backend (JWT)
- [ ] Phase 3 — Auth frontend (login / register)
- [ ] Phase 4 — Ideas CRUD
- [ ] Phase 5 — AI validation reports
- [ ] Phase 6 — UI polish and responsive layout
