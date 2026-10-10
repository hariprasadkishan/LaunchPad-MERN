import mongoose from 'mongoose'

/**
 * Connect to MongoDB.
 * Throws on failure so the caller (index.js) can decide whether to exit.
 * Never logs the full connection string — only a safe database-name label.
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables')
  }

  // Extract the database name from the URI path without invoking the URL
  // constructor, which chokes on unescaped characters in Atlas passwords.
  // Matches the path segment between the last "/" and an optional "?".
  const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/)
  const dbName = dbNameMatch ? dbNameMatch[1] : 'default'

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠  MongoDB disconnected')
  })

  mongoose.connection.on('reconnected', () => {
    console.log('🔄  MongoDB reconnected')
  })

  await mongoose.connect(uri)
  console.log(`✅  MongoDB connected → database: "${dbName}"`)
}
