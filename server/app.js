import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'
import ideaRoutes from './routes/ideaRoutes.js'

const app = express()

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

// ── Routes ────────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  const dbStates = {
    0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting',
  }
  res.json({
    status: 'ok',
    message: 'LaunchPad API is running',
    db: dbStates[mongoose.connection.readyState] ?? 'unknown',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/ideas', ideaRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

export default app
