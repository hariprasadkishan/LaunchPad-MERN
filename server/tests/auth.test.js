/**
 * Regression tests for authentication endpoints.
 * Mocks mongoose User model — no real MongoDB needed.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'

// ── Mock mongoose before importing app ────────────────────────────────────────
vi.mock('mongoose', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    connect: vi.fn().mockResolvedValue(true),
    connection: { readyState: 1, on: vi.fn() },
  }
})

// ── Mock the User model ───────────────────────────────────────────────────────
vi.mock('../models/User.js', () => {
  const save = vi.fn()
  const mockUser = {
    _id: 'user-id-123',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: '$2a$12$hashedpassword',
    save,
    toJSON() { return { _id: this._id, name: this.name, email: this.email } },
    toObject() { return { _id: this._id, name: this.name, email: this.email, passwordHash: this.passwordHash } },
  }
  return {
    default: {
      findOne: vi.fn(),
      create: vi.fn().mockResolvedValue(mockUser),
      findById: vi.fn(),
    },
  }
})

import app from '../app.js'
import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

beforeEach(() => { vi.clearAllMocks() })

describe('POST /api/auth/register', () => {
  it('returns 400 if fields are missing', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/required/i)
  })

  it('returns 400 if password is too short', async () => {
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'short' })
    expect(res.status).toBe(400)
    expect(res.body.message).toMatch(/8 characters/i)
  })

  it('returns 409 if email already exists', async () => {
    User.findOne.mockResolvedValueOnce({ email: 'alice@example.com' })
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' })
    expect(res.status).toBe(409)
    expect(res.body.message).toMatch(/already exists/i)
  })

  it('returns 201 with token and user on success', async () => {
    User.findOne.mockResolvedValueOnce(null)
    const res = await request(app).post('/api/auth/register')
      .send({ name: 'Alice', email: 'alice@example.com', password: 'password123' })
    expect(res.status).toBe(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe('test@example.com')
    expect(res.body.user.passwordHash).toBeUndefined()
  })
})

describe('POST /api/auth/login', () => {
  it('returns 400 if fields are missing', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'a@b.com' })
    expect(res.status).toBe(400)
  })

  it('returns 401 for unknown email', async () => {
    User.findOne.mockResolvedValueOnce(null)
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })
    expect(res.status).toBe(401)
    expect(res.body.message).toMatch(/invalid/i)
  })

  it('returns 401 for wrong password', async () => {
    User.findOne.mockResolvedValueOnce({
      _id: 'uid', passwordHash: await bcrypt.hash('correctpass', 1),
      toJSON() { return { _id: 'uid', email: 'a@b.com' } },
    })
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'a@b.com', password: 'wrongpass' })
    expect(res.status).toBe(401)
  })

  it('returns 200 with token on valid credentials', async () => {
    const hash = await bcrypt.hash('password123', 1)
    User.findOne.mockResolvedValueOnce({
      _id: 'uid', email: 'alice@example.com', passwordHash: hash,
      toJSON() { return { _id: 'uid', email: 'alice@example.com' } },
    })
    const res = await request(app).post('/api/auth/login')
      .send({ email: 'alice@example.com', password: 'password123' })
    expect(res.status).toBe(200)
    expect(res.body.token).toBeTruthy()
  })
})
