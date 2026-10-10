import mongoose from 'mongoose'
import Idea from '../models/Idea.js'

/** Reusable ObjectId validator — returns 400 before hitting the DB */
function assertValidId(id, res) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ message: 'Invalid idea ID' })
    return false
  }
  return true
}

// ── GET /api/ideas ────────────────────────────────────────────────────────────
export async function getIdeas(req, res, next) {
  try {
    const ideas = await Idea.find({ owner: req.user._id }).sort({ createdAt: -1 })
    res.json(ideas)
  } catch (err) {
    next(err)
  }
}

// ── POST /api/ideas ───────────────────────────────────────────────────────────
export async function createIdea(req, res, next) {
  try {
    const { title, problem, targetAudience, solution } = req.body

    if (!title || !problem || !targetAudience || !solution) {
      return res.status(400).json({ message: 'Title, problem, target audience, and solution are all required' })
    }

    // owner and status are never accepted from the client
    const idea = await Idea.create({
      owner: req.user._id,
      title: title.trim(),
      problem: problem.trim(),
      targetAudience: targetAudience.trim(),
      solution: solution.trim(),
    })

    res.status(201).json(idea)
  } catch (err) {
    next(err)
  }
}

// ── GET /api/ideas/:id ────────────────────────────────────────────────────────
export async function getIdea(req, res, next) {
  try {
    if (!assertValidId(req.params.id, res)) return

    // Ownership is enforced in the query — non-owner gets 404, not 403
    const idea = await Idea.findOne({ _id: req.params.id, owner: req.user._id })
    if (!idea) return res.status(404).json({ message: 'Idea not found' })

    res.json(idea)
  } catch (err) {
    next(err)
  }
}

// ── PUT /api/ideas/:id ────────────────────────────────────────────────────────
export async function updateIdea(req, res, next) {
  try {
    if (!assertValidId(req.params.id, res)) return

    // Only these four fields are ever accepted — owner and status are ignored
    const { title, problem, targetAudience, solution } = req.body

    if (!title || !problem || !targetAudience || !solution) {
      return res.status(400).json({ message: 'Title, problem, target audience, and solution are all required' })
    }

    const idea = await Idea.findOne({ _id: req.params.id, owner: req.user._id })
    if (!idea) return res.status(404).json({ message: 'Idea not found' })

    idea.title = title.trim()
    idea.problem = problem.trim()
    idea.targetAudience = targetAudience.trim()
    idea.solution = solution.trim()
    await idea.save()

    res.json(idea)
  } catch (err) {
    next(err)
  }
}

// ── DELETE /api/ideas/:id ─────────────────────────────────────────────────────
export async function deleteIdea(req, res, next) {
  try {
    if (!assertValidId(req.params.id, res)) return

    const idea = await Idea.findOneAndDelete({ _id: req.params.id, owner: req.user._id })
    if (!idea) return res.status(404).json({ message: 'Idea not found' })

    res.json({ message: 'Idea deleted' })
  } catch (err) {
    next(err)
  }
}
