import { Router } from 'express'
import { protect } from '../middleware/authMiddleware.js'
import {
  getIdeas,
  createIdea,
  getIdea,
  updateIdea,
  deleteIdea,
} from '../controllers/ideaController.js'

const router = Router()

// All idea routes require authentication
router.use(protect)

router.route('/').get(getIdeas).post(createIdea)
router.route('/:id').get(getIdea).put(updateIdea).delete(deleteIdea)

export default router
