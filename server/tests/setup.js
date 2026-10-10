// Provide minimum env vars so dotenv-dependent modules don't throw at import time
process.env.JWT_SECRET = 'test-secret-for-vitest-only'
process.env.JWT_EXPIRES_IN = '1h'
process.env.MONGODB_URI = 'mongodb://localhost:27017/launchpad-test'
process.env.PORT = '5001'
// GROQ_API_KEY intentionally left unset here — individual tests set it as needed
