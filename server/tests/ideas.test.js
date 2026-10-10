/**
 * Regression tests for ideas CRUD + ownership isolation.
 * Mocks mongoose Idea model and User model — no real MongoDB needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

// ── Mock mongoose ─────────────────────────────────────────────────────────────
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(true),
    connection: { readyState: 1, on: vi.fn() },
  }
})

// ── Mock User model (used by protect middleware) ──────────────────────────────
const USER_A = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', name: 'User A', email: 'a@test.com',
  toJSON() { return { _id: this._id, name: this.name, email: this.email } } }
const USER_B = { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'User B', email: 'b@test.com',
  toJSON() { return { _id: this._id, name: this.name, email: this.email } } }

vi.mock('../models/User.js', () => ({
  default: { findById: vi.fn() },
}))

// ── Mock Idea model ───────────────────────────────────────────────────────────
vi.mock('../models/Idea.js', () => {
  const mockSave = vi.fn().mockResolvedValue(true)
  const mockIdea = {
    _id: 'idea-id-001',
    owner: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    title: 'Test Idea',
    problem: 'A problem',
    targetAudience: 'Everyone',
    solution: 'A solution',
    status: 'draft',
    validationReport: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    save: mockSave,
    toJSON() { return { ...this } },
  }
  return {
    default: {
      find: vi.fn(),
      findOne: vi.fn(),
      create: vi.fn().mockResolvedValue(mockIdea),
      findOneAndDelete: vi.fn(),
    },
  }
})

import app from '../app.js'
import User from '../models/User.js'
import Idea from '../models/Idea.js'

// Helper: make a signed JWT for a given user id
function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}

const tokenA = makeToken('aaaaaaaaaaaaaaaaaaaaaaaa')
const tokenB = makeToken('bbbbbbbbbbbbbbbbbbbbbbbb')

beforeEach(() => {
  vi.clearAllMocks()
  // Default: protect middleware resolves to User A
  User.findById.mockImplementation((id) => {
    if (String(id) === 'aaaaaaaaaaaaaaaaaaaaaaaa') return Promise.resolve(USER_A)
    if (String(id) === 'bbbbbbbbbbbbbbbbbbbbbbbb') return Promise.resolve(USER_B)
    return Promise.resolve(null)
  })
})

describe('Ideas CRUD — authentication guard', () => {
  it('returns 401 with no token', async () => {
    const res = await request(app).get('/api/ideas')
    expect(res.status).toBe(401)
  })

  it('returns 401 with a malformed token', async () => {
    const res = await request(app).get('/api/ideas').set('Authorization', 'Bearer badtoken')
    expect(res.status).toBe(401)
  })
})

describe('GET /api/ideas', () => {
  it('returns 200 with idea list for authenticated user', async () => {
    Idea.find.mockReturnValue({ sort: vi.fn().mockResolvedValue([]) })
    const res = await request(app).get('/api/ideas').set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })
})

describe('POST /api/ideas', () => {
  it('returns 400 if required fields are missing', async () => {
    const res = await request(app).post('/api/ideas')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'Only title' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/required/i)
  })

  it('returns 201 on valid idea creation', async () => {
    const res = await request(app).post('/api/ideas')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ title: 'My Idea', problem: 'Problem', targetAudience: 'Everyone', solution: 'Solution' })
    expect(res.status).toBe(201)
  })
})

describe('GET /api/ideas/:id', () => {
  it('returns 400 for malformed ID', async () => {
    const res = await request(app).get('/api/ideas/not-an-id')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid idea id/i)
  })

  it('returns 404 when idea not found or wrong owner', async () => {
    Idea.findOne.mockResolvedValueOnce(null)
    const res = await request(app).get('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(404)
  })

  it('returns 200 with the idea for the owner', async () => {
    Idea.findOne.mockResolvedValueOnce({
      _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', title: 'Test', problem: 'P',
      targetAudience: 'T', solution: 'S', status: 'draft', owner: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    })
    const res = await request(app).get('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200)
  })
})

describe('Ownership isolation', () => {
  it('User B cannot read User A\'s idea', async () => {
    // findOne called with owner: USER_B._id returns null (not owner)
    Idea.findOne.mockResolvedValueOnce(null)
    const res = await request(app).get('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${tokenB}`)
    expect(res.status).toBe(404)
  })

  it('User B cannot update User A\'s idea', async () => {
    Idea.findOne.mockResolvedValueOnce(null)
    const res = await request(app).put('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ title: 'Hacked', problem: 'x', targetAudience: 'x', solution: 'x' })
    expect(res.status).toBe(404)
  })

  it('User B cannot delete User A\'s idea', async () => {
    Idea.findOneAndDelete.mockResolvedValueOnce(null)
    const res = await request(app).delete('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${tokenB}`)
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/ideas/:id', () => {
  it('returns 200 when owner deletes their idea', async () => {
    Idea.findOneAndDelete.mockResolvedValueOnce({ _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', title: 'Old' })
    const res = await request(app).delete('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(200)
    expect(res.body.message).toMatch(/deleted/i)
  })
})
