/**
 * Tests for POST /api/ideas/:id/validate
 * AI service is mocked — no real Groq calls made.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import jwt from 'jsonwebtoken'

// ── Hoist shared constants so vi.mock factories can reference them ────────────
const { USER_A, mockSave } = vi.hoisted(() => {
  const mockSave = vi.fn().mockResolvedValue(true)
  const USER_A = {
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    name: 'User A',
    email: 'a@test.com',
    toJSON() { return { _id: this._id, name: this.name, email: this.email } },
  }
  return { USER_A, mockSave }
})

// ── Mock mongoose ─────────────────────────────────────────────────────────────
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(true),
    connection: { readyState: 1, on: vi.fn() },
  }
})

// ── Mock User model ───────────────────────────────────────────────────────────
vi.mock('../models/User.js', () => ({
  default: { findById: vi.fn().mockResolvedValue(USER_A) },
}))

// ── Mock Idea model ───────────────────────────────────────────────────────────
vi.mock('../models/Idea.js', () => ({
  default: { findOne: vi.fn() },
}))

// ── Mock AI service ───────────────────────────────────────────────────────────
vi.mock('../services/aiService.js', async () => {
  const actual = await import('../services/aiService.js')
  return {
    ...actual,
    generateValidationReport: vi.fn(),
  }
})

import app from '../app.js'
import User from '../models/User.js'
import Idea from '../models/Idea.js'
import { generateValidationReport, ConfigError, AIValidationError, AIProviderError } from '../services/aiService.js'

const VALID_REPORT = {
  overallScore: 78,
  problemClarity: 80,
  targetAudienceFit: 75,
  marketPotential: 70,
  strengths: ['Clear problem definition', 'Large addressable market'],
  risks: ['High competition', 'Regulatory uncertainty'],
  nextSteps: ['Conduct user interviews', 'Build an MVP'],
  summary: 'A promising idea with strong fundamentals and manageable risks.',
  generatedAt: new Date(),
}

function makeToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1h' })
}
const tokenA = makeToken('aaaaaaaaaaaaaaaaaaaaaaaa')
const tokenB = makeToken('bbbbbbbbbbbbbbbbbbbbbbbb')

function makeMockIdea(overrides = {}) {
  return {
    _id: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    owner: 'aaaaaaaaaaaaaaaaaaaaaaaa',
    title: 'Test Idea',
    problem: 'A real problem',
    targetAudience: 'Developers',
    solution: 'A real solution',
    status: 'draft',
    validationReport: undefined,
    save: mockSave,
    toJSON() { return { ...this } },
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mockSave.mockResolvedValue(true)
  User.findById.mockImplementation((id) =>
    String(id) === 'aaaaaaaaaaaaaaaaaaaaaaaa'
      ? Promise.resolve(USER_A)
      : Promise.resolve(null)
  )
})

describe('POST /api/ideas/:id/validate', () => {
  it('returns 401 with no auth token', async () => {
    const res = await request(app).post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
    expect(res.status).toBe(401)
  })

  it('returns 400 for a malformed ObjectId', async () => {
    const res = await request(app)
      .post('/api/ideas/not-a-valid-id/validate')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/invalid idea id/i)
  })

  it('returns 404 when idea does not belong to the requesting user', async () => {
    User.findById.mockResolvedValue({
      _id: 'bbbbbbbbbbbbbbbbbbbbbbbb', name: 'B',
      toJSON() { return { _id: 'bbbbbbbbbbbbbbbbbbbbbbbb' } },
    })
    Idea.findOne.mockResolvedValueOnce(null)
    const res = await request(app)
      .post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
      .set('Authorization', `Bearer ${tokenB}`)
    expect(res.status).toBe(404)
  })

  it('returns 500 when GROQ_API_KEY is not configured', async () => {
    Idea.findOne.mockResolvedValueOnce(makeMockIdea())
    generateValidationReport.mockRejectedValueOnce(
      new ConfigError('AI provider is not configured. Set GROQ_API_KEY in server/.env')
    )
    const res = await request(app)
      .post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(500)
    expect(res.body.message).toMatch(/not configured/i)
  })

  it('returns 500 when AI returns malformed response', async () => {
    Idea.findOne.mockResolvedValueOnce(makeMockIdea())
    generateValidationReport.mockRejectedValueOnce(
      new AIValidationError('Missing or invalid score field: "overallScore"')
    )
    const res = await request(app)
      .post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(500)
    expect(res.body.message).toMatch(/invalid response/i)
  })

  it('returns 502 when the AI provider throws a network or API error', async () => {
    Idea.findOne.mockResolvedValueOnce(makeMockIdea())
    generateValidationReport.mockRejectedValueOnce(
      new AIProviderError('AI provider request timed out after 30 seconds')
    )
    const res = await request(app)
      .post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
      .set('Authorization', `Bearer ${tokenA}`)
    expect(res.status).toBe(502)
    expect(res.body.message).toMatch(/timed out/i)
  })

  it('does NOT overwrite the existing report or status when AI fails', async () => {
    const existingReport = { ...VALID_REPORT, overallScore: 55, summary: 'Previous report' }
    const idea = makeMockIdea({ validationReport: existingReport, status: 'validated' })
    Idea.findOne.mockResolvedValueOnce(idea)
    generateValidationReport.mockRejectedValueOnce(new AIProviderError('Network error'))

    await request(app)
      .post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(mockSave).not.toHaveBeenCalled()
    expect(idea.validationReport.summary).toBe('Previous report')
    expect(idea.status).toBe('validated')
  })

  it('returns 200 with validationReport and status=validated on success', async () => {
    const idea = makeMockIdea()
    Idea.findOne.mockResolvedValueOnce(idea)
    generateValidationReport.mockResolvedValueOnce(VALID_REPORT)

    const res = await request(app)
      .post('/api/ideas/aaaaaaaaaaaaaaaaaaaaaaaa/validate')
      .set('Authorization', `Bearer ${tokenA}`)

    expect(res.status).toBe(200)
    expect(idea.status).toBe('validated')
    expect(idea.validationReport.overallScore).toBe(78)
    expect(mockSave).toHaveBeenCalledOnce()
  })
})
