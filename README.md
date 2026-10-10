# LaunchPad — AI Startup Idea Validation Workspace

LaunchPad is a full-stack MERN application that helps founders and early-stage entrepreneurs evaluate startup ideas before committing time and resources to building them. Users create an account, describe their startup concept, and receive an AI-generated validation report with viability scores, strengths, risks, and recommended next steps — powered by the Groq LLM API.

> **AI Disclaimer:** Validation scores and recommendations are AI-generated estimates from a language model. They are not verified market research, professional business advice, or guarantees of commercial success.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Project Structure](#project-structure)
5. [Installation and Setup](#installation-and-setup)
6. [Running the Application](#running-the-application)
7. [API Reference](#api-reference)
8. [Testing](#testing)
9. [AI Development Experience](#ai-development-experience)
10. [AI Disclaimer](#ai-disclaimer)

---

## Project Overview

Many founders spend months building products that solve problems nobody has. LaunchPad addresses this by providing instant, structured AI feedback on a startup idea — before a single line of product code is written.

**Target users:** Aspiring founders, product managers, students, and hackathon participants who want rapid, structured feedback on a business concept.

**What the app does:**
- Lets users register, log in, and manage a personal workspace of startup ideas
- Stores each idea's title, problem statement, target audience, and proposed solution
- Sends the idea to the Groq API and returns a structured validation report saved to MongoDB
- Displays the report with an overall score, four sub-scores, an executive summary, and three categorised insight lists

---

## Features

| Feature | Status |
|---------|--------|
| User registration and login | ✅ Implemented |
| Password hashing with bcryptjs | ✅ Implemented |
| JWT-based authentication and session persistence | ✅ Implemented |
| Protected routes — unauthenticated users redirected to login | ✅ Implemented |
| User-specific data — users see only their own ideas | ✅ Implemented |
| Create, view, edit, and delete startup ideas (full CRUD) | ✅ Implemented |
| Groq-powered AI validation per idea | ✅ Implemented |
| Structured validation report: overall score, problem clarity, target audience fit, market potential | ✅ Implemented |
| Report details: executive summary, strengths, risks, recommended next steps | ✅ Implemented |
| Persistent storage of ideas and reports in MongoDB | ✅ Implemented |
| Re-validate an idea (replaces the previous report only on success) | ✅ Implemented |
| Loading, empty, and error states throughout the UI | ✅ Implemented |
| Delete confirmation modal | ✅ Implemented |
| Responsive layout with Tailwind CSS | ✅ Implemented |
| Backend health-check endpoint | ✅ Implemented |

---

## Technologies Used

### Frontend
| Package | Version |
|---------|---------|
| React | ^19.2.8 |
| Vite | ^8.3.0 |
| Tailwind CSS | ^3.4.19 |
| React Router DOM | ^7.18.4 |
| Axios | ^1.20.0 |

### Backend
| Package | Version |
|---------|---------|
| Node.js | 22.x |
| Express | ^5.3.0 |
| Mongoose | ^9.11.1 |
| dotenv | ^18.0.7 |
| cors | ^2.8.6 |

### Database
- MongoDB 7 (local or MongoDB Atlas)

### Authentication
| Package | Version |
|---------|---------|
| bcryptjs | ^3.0.3 |
| jsonwebtoken | ^9.0.3 |

### AI Integration
| Package | Version |
|---------|---------|
| groq-sdk | ^1.6.0 |

**Model used:** `llama-3.3-70b-versatile` (configurable via `GROQ_MODEL`)

### Testing
| Package | Version |
|---------|---------|
| Vitest | ^5.0.3 |
| Supertest | ^7.3.1 |

### Development Tool
- **Kiro** — AI-assisted development environment (see [AI Development Experience](#ai-development-experience))

---

## Project Structure

```
LaunchPad/
├── client/                        # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ideas/
│   │   │   │   └── IdeaCard.jsx   # Dashboard idea card with actions
│   │   │   ├── layout/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   └── ui/
│   │   │       └── InputField.jsx # Reusable labeled input
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # JWT + user state (localStorage)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx  # Idea list with loading/empty states
│   │   │   ├── IdeaFormPage.jsx   # Create and edit (shared component)
│   │   │   └── IdeaDetailPage.jsx # View idea + validation report
│   │   ├── services/
│   │   │   ├── api.js             # Axios instance with JWT interceptor
│   │   │   └── ideaService.js     # All idea API calls incl. validateIdea
│   │   ├── App.jsx                # Router with AuthProvider
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── vite.config.js             # Dev server on :3000, proxy /api → :5000
│
├── server/                        # Node.js + Express backend
│   ├── config/
│   │   └── db.js                  # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js      # register, login
│   │   └── ideaController.js      # CRUD + validateIdea
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT protect middleware
│   ├── models/
│   │   ├── User.js
│   │   └── Idea.js                # Includes validationReport subdocument
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── ideaRoutes.js          # All routes behind protect middleware
│   ├── services/
│   │   └── aiService.js           # Groq API call, prompt, JSON validation
│   ├── tests/
│   │   ├── auth.test.js
│   │   ├── ideas.test.js
│   │   ├── validate.test.js
│   │   └── setup.js
│   ├── app.js                     # Express app (importable without starting server)
│   ├── index.js                   # Entry point: connectDB + listen
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## Installation and Setup

### Prerequisites

- **Node.js** v18 or later ([nodejs.org](https://nodejs.org))
- **MongoDB** — either:
  - Local: install MongoDB 7 and run `mongod`
  - Cloud: create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Groq API key** — free account at [console.groq.com](https://console.groq.com) (no credit card required)

---

### Step 1 — Clone the repository

```bash
git clone https://github.com/hariprasadkishan/LaunchPad-MERN.git
cd LaunchPad-MERN
```

---

### Step 2 — Install dependencies

Install backend and frontend dependencies separately:

```bash
# Backend
cd server
npm install

# Frontend (open a new terminal or navigate back)
cd ../client
npm install
```

---

### Step 3 — Configure the backend environment

```bash
cd server
cp .env.example .env
```

Open `server/.env` and fill in the required values:

```env
PORT=5000

# MongoDB — choose one:
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/launchpad

# MongoDB Atlas (replace with your actual connection string)
# MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/launchpad?appName=LaunchPad

# JWT — generate a long random string (e.g. openssl rand -hex 32)
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRES_IN=7d

# Groq AI
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
```

**Getting your Groq API key:**
1. Sign up at [console.groq.com](https://console.groq.com) — free, no credit card required
2. Navigate to **API Keys** → **Create API Key**
3. Copy the key and paste it as the value of `GROQ_API_KEY`

**⚠ Keep your `.env` file private.** It is listed in `.gitignore` and must never be committed to Git.

---

## Running the Application

Open **two separate terminals** from the project root.

**Terminal 1 — Backend server**

```bash
cd server
npm run dev
```

Expected output:
```
✅  MongoDB connected → database: "launchpad"
🚀  Server running on http://localhost:5000
```

**Terminal 2 — Frontend dev server**

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v8.x.x  ready in ...ms
  ➜  Local:   http://localhost:3000/
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

The Vite dev server automatically proxies all `/api/*` requests to `localhost:5000`, so no CORS configuration is needed during development.

---

### Health check

Verify the backend is running and connected to MongoDB:

```
GET http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "LaunchPad API is running",
  "db": "connected"
}
```

---

## API Reference

All idea endpoints require an `Authorization: Bearer <token>` header. The token is returned by the register and login endpoints.

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | — | Create a new account. Returns `{ token, user }` |
| `POST` | `/api/auth/login` | — | Login. Returns `{ token, user }` |

**Register / Login body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securepassword"
}
```

### Ideas

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/ideas` | ✓ | List the authenticated user's ideas |
| `POST` | `/api/ideas` | ✓ | Create a new idea |
| `GET` | `/api/ideas/:id` | ✓ | Get a single idea (owner only) |
| `PUT` | `/api/ideas/:id` | ✓ | Update an idea (owner only) |
| `DELETE` | `/api/ideas/:id` | ✓ | Delete an idea (owner only) |
| `POST` | `/api/ideas/:id/validate` | ✓ | Generate and save an AI validation report (owner only) |

**Create / Update idea body:**
```json
{
  "title": "AI Meal Planner for Athletes",
  "problem": "Athletes struggle to plan nutritious meals that meet their training demands.",
  "targetAudience": "Amateur and semi-professional athletes aged 18–35",
  "solution": "An app that generates personalised weekly meal plans using AI based on training schedule and dietary goals."
}
```

**Validation report response** (embedded in the idea object):
```json
{
  "validationReport": {
    "overallScore": 74,
    "problemClarity": 80,
    "targetAudienceFit": 78,
    "marketPotential": 65,
    "strengths": ["Clear target segment", "Scalable model"],
    "risks": ["Competitive market", "Regulatory complexity"],
    "nextSteps": ["Conduct user interviews", "Build a landing page"],
    "summary": "A focused idea with a well-defined audience...",
    "generatedAt": "2026-10-10T19:55:02.636Z"
  }
}
```

---

## Testing

All tests run without a live database or real Groq API calls — MongoDB and the AI service are fully mocked.

```bash
cd server
npm test
```

**Latest confirmed results (run on 2026-10-11):**

```
Test Files  3 passed (3)
     Tests  28 passed (28)
  Duration  ~2s
```

### Test coverage

| File | Tests | What is tested |
|------|-------|---------------|
| `auth.test.js` | 8 | Registration (success, duplicate, short password, missing fields), login (success, wrong password, unknown email, missing fields) |
| `ideas.test.js` | 12 | Auth guard (no token, bad token), list, create, get, delete, malformed ID, ownership isolation (User B blocked on read/update/delete of User A's idea) |
| `validate.test.js` | 8 | 401/400/404 guards, missing API key → 500, malformed AI response → 500, provider error → 502, no overwrite on failure, success path → 200 |

### Frontend production build

```bash
cd client
npm run build
```

**Latest confirmed result:**
```
✓ 91 modules transformed
✓ built in ~1s
```

---

## AI Development Experience

This project was built using **Kiro**, an AI-assisted development environment built on VS Code, as the primary development tool.

### How Kiro was used

Kiro was used throughout the entire development lifecycle — not as a code generator that was blindly accepted, but as a collaborative tool that required continuous review, testing, and decision-making:

- **Codebase exploration:** Used Kiro to inspect existing files, understand the project structure at each phase, and identify what needed to be built next before writing any code.
- **Component and page generation:** Kiro generated React pages (Login, Register, Dashboard, IdeaForm, IdeaDetail) and reusable UI components, which were then reviewed for correctness and design consistency.
- **Backend API development:** Kiro built the Express authentication routes, idea CRUD endpoints, and the AI validation endpoint, following patterns established earlier in the project.
- **MongoDB integration:** Kiro designed the Mongoose schemas (User, Idea with validationReport subdocument), enforced user ownership in every query, and implemented the database connection with safe credential handling.
- **Groq integration:** Kiro built the AI service layer — constructing the structured prompt, calling the Groq Chat Completions API, parsing and validating the JSON response, and handling error cases (missing config, provider failures, malformed output) with typed errors.
- **Debugging:** Several issues were encountered and resolved during development: a malformed MongoDB Atlas URI, environment variable key mismatches (`MONGO_URI` vs `MONGODB_URI`), a `vi.mock` hoisting error in tests, and an unescaped apostrophe causing a build failure. Each was diagnosed and fixed iteratively.
- **Automated tests:** Kiro wrote the Vitest + Supertest test suite covering authentication, CRUD ownership isolation, and AI validation — with all database and AI dependencies fully mocked.

### My role throughout

At every step, I reviewed and approved the proposed changes before they were applied, ran the commands myself, verified behaviour in the browser, investigated failures, and made the architectural and implementation decisions. I confirmed that tests passed and the production build was clean before accepting each phase as complete.

---

### Specific AI-Assisted Tasks

1. **Built React pages and reusable UI components** — Login, Register, Dashboard with loading/empty states, IdeaForm (shared create/edit), IdeaDetail with validation report display, and primitives (InputField, IdeaCard, ProtectedRoute).

2. **Created Express authentication and idea CRUD APIs** — register/login with bcrypt password hashing, JWT signing and verification, and all five idea endpoints with input validation, ObjectId checks, and correct HTTP status codes.

3. **Integrated MongoDB models and enforced user ownership** — Mongoose schemas for User and Idea (including the validationReport subdocument), with every read/write/delete query scoped to `owner: req.user._id` so users can never access each other's data.

4. **Integrated the Groq API and built structured validation reports** — isolated `aiService.js` with a structured JSON prompt, response parsing, field-by-field validation (scores clamped 0–100, arrays/strings verified), typed error classes, and a 30-second timeout. Failed validations never overwrite a previous report.

5. **Debugged issues, wrote automated tests, and verified the production build** — resolved URI formatting, env variable naming, and test hoisting errors; wrote 28 mocked Vitest + Supertest tests across three suites; confirmed a clean Vite production build.

---

## AI Disclaimer

All validation scores, summaries, and recommendations displayed in LaunchPad are generated by a large language model (Groq — `llama-3.3-70b-versatile`). They represent directional estimates based on the text you provide and are **not**:

- Verified market research
- Professional business, legal, or financial advice
- Predictions or guarantees of commercial success

Use the reports as a starting point for your own research, not as a substitute for it.
