import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'

const app = express()
const PORT = process.env.PORT || 5000

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────

// Health check — reports both API and DB status
app.get('/api/health', (_req, res) => {
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  }
  res.json({
    status: 'ok',
    message: 'LaunchPad API is running',
    db: dbStates[mongoose.connection.readyState] ?? 'unknown',
  })
})

app.use('/api/auth', authRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

// ── Startup ───────────────────────────────────────────────────────────────────
async function startServer() {
  try {
    await connectDB()                          // connect to DB first …
    app.listen(PORT, () => {                   // … then open the port
      console.log(`🚀  Server running on http://localhost:${PORT}`)
    })
  } catch (err) {
    // Log the message only — never the URI, which may contain credentials
    console.error(`❌  Failed to start: ${err.message}`)
    process.exit(1)
  }
}

startServer()
