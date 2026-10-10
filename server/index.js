import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(express.json())

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LaunchPad API is running' })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' })
})

// Global error handler
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
})
