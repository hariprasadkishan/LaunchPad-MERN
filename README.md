# LaunchPad

AI-powered startup idea validation platform. Describe your startup concept and receive an instant validation report with market analysis, competitive insights, and a viability score — powered by Groq's LLM API.

> **Note:** AI-generated scores and insights are directional assessments from a language model, not verified market research or guarantees of commercial success.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3, React Router v7 |
| Backend | Node.js 22, Express 5, Mongoose 9 |
| Database | MongoDB 7 (local or MongoDB Atlas) |
| Auth | JWT (bcryptjs, jsonwebtoken) |
| AI | Groq Chat Completions API (`groq-sdk`) |
| Tests | Vitest, Supertest |

---

## Features

- **User authentication** — register, login, JWT-protected sessions
- **Idea management** — create, view, edit, delete startup ideas (CRUD)
- **AI validation** — instant validation report per idea including:
  - Overall viability score (0–100)
  - Problem clarity, target audience fit, and market potential scores
  - Executive summary
  - Strengths, risks, and recommended next steps
- **Ownership isolation** — users can only access and modify their own ideas
- **Persistent reports** — reports are saved to MongoDB and shown on revisit

---

## Prerequisites

- Node.js ≥ 18
- MongoDB running locally (`mongod`) or a MongoDB Atlas connection string
- A free [Groq API key](https://console.groq.com) (no credit card required for free tier)

---

## Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd nEWWWW
```

### 2. Configure the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and fill in:

```env
MONGODB_URI=mongodb://localhost:27017/launchpad
JWT_SECRET=<generate a long random string>
GROQ_API_KEY=<your key from https://console.groq.com>
GROQ_MODEL=llama-3.3-70b-versatile
```

**Getting a Groq API key:**
1. Sign up at [console.groq.com](https://console.groq.com) — free, no credit card required
2. Go to **API Keys** → **Create API Key**
3. Paste the key as `GROQ_API_KEY` in `server/.env`

**Default model:** `llama-3.3-70b-versatile`  
Change `GROQ_MODEL` to any supported model listed at [console.groq.com/docs/models](https://console.groq.com/docs/models).

> The API key lives only on the server. It is never sent to the browser.

### 3. Install dependencies

```bash
# From the project root
cd server && npm install
cd ../client && npm install
```

---

## Running the app

Open **two terminals**:

**Terminal 1 — Backend**
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
cd client
npm run dev
# Runs on http://localhost:3000
```

The Vite proxy forwards `/api/*` requests to `localhost:5000` automatically.

---

## Running the tests

```bash
cd server
npm test
```

- 28 tests across 3 suites (auth, ideas CRUD, AI validation)
- All AI and database dependencies are mocked — no real API calls or live MongoDB connection required

---

## API Reference

### Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login, returns JWT |

### Ideas

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/ideas` | ✓ | List authenticated user's ideas |
| POST | `/api/ideas` | ✓ | Create a new idea |
| GET | `/api/ideas/:id` | ✓ | Get a single idea (owner only) |
| PUT | `/api/ideas/:id` | ✓ | Update an idea (owner only) |
| DELETE | `/api/ideas/:id` | ✓ | Delete an idea (owner only) |
| POST | `/api/ideas/:id/validate` | ✓ | Generate AI validation report (owner only) |

### Health

```
GET /api/health
→ { "status": "ok", "message": "LaunchPad API is running", "db": "connected" }
```

---

## Project Structure

```
nEWWWW/
├── client/               # React + Vite frontend
│   └── src/
│       ├── components/   # IdeaCard, InputField, ProtectedRoute
│       ├── context/      # AuthContext (JWT + user state)
│       ├── pages/        # LandingPage, Login, Register, Dashboard, IdeaForm, IdeaDetail
│       └── services/     # api.js (Axios + JWT interceptor), ideaService.js
└── server/               # Express backend
    ├── config/           # MongoDB connection
    ├── controllers/      # authController, ideaController (+ validateIdea)
    ├── middleware/        # JWT protect middleware
    ├── models/           # User, Idea (with validationReport subdocument)
    ├── routes/           # authRoutes, ideaRoutes
    ├── services/         # aiService.js (Groq integration)
    └── tests/            # auth.test.js, ideas.test.js, validate.test.js
```

---

## Development notes

Portions of this application were developed with AI coding assistance (Kiro). All generated code was reviewed, tested, and verified before being committed. The AI validation feature uses Groq's API and is clearly labelled in the UI as an AI-generated assessment, not professional advice.

---

## Roadmap

- [x] Phase 1 — Project scaffolding
- [x] Phase 2 — Auth backend (JWT)
- [x] Phase 3 — Auth frontend (login / register)
- [x] Phase 4 — Ideas CRUD
- [x] Phase 5 — AI validation reports (Groq)
