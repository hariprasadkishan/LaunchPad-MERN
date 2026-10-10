import jwt from 'jsonwebtoken'
import User from '../models/User.js'

/**
 * Protect middleware — verifies the Bearer JWT and attaches req.user.
 * Apply to any route that requires authentication.
 */
export async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorised — no token provided' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'Not authorised — user no longer exists' })
    }

    req.user = user // available in downstream handlers
    next()
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorised — invalid or expired token' })
    }
    next(err)
  }
}
