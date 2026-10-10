import Groq from 'groq-sdk'

// ── Typed errors so the controller can return the right HTTP status ───────────

export class ConfigError extends Error {
  constructor(msg) { super(msg); this.name = 'ConfigError' }
}

export class AIValidationError extends Error {
  constructor(msg) { super(msg); this.name = 'AIValidationError' }
}

export class AIProviderError extends Error {
  constructor(msg) { super(msg); this.name = 'AIProviderError' }
}

// ── Score helper ──────────────────────────────────────────────────────────────

function clampScore(val) {
  const n = Number(val)
  if (!Number.isFinite(n)) return null
  return Math.min(100, Math.max(0, Math.round(n)))
}

function requireScore(raw, fieldName) {
  const n = clampScore(raw)
  if (n === null) throw new AIValidationError(`Missing or invalid score field: "${fieldName}"`)
  return n
}

function requireStringArray(raw, fieldName) {
  // Allow empty arrays — a legitimate result for some ideas
  if (!Array.isArray(raw)) throw new AIValidationError(`Expected an array for "${fieldName}"`)
  return raw.map(String).filter(s => s.trim().length > 0)
}

function requireString(raw, fieldName) {
  if (typeof raw !== 'string' || !raw.trim()) {
    throw new AIValidationError(`Missing or empty string field: "${fieldName}"`)
  }
  return raw.trim()
}

// ── Prompt ────────────────────────────────────────────────────────────────────

function buildPrompt(idea) {
  return `You are an expert startup analyst. Evaluate the following startup idea and respond with ONLY a valid JSON object — no markdown, no explanation.

IDEA:
Title: ${idea.title}
Problem: ${idea.problem}
Target audience: ${idea.targetAudience}
Proposed solution: ${idea.solution}

Return this exact JSON structure (all score fields must be integers 0-100):
{
  "overallScore": <integer 0-100>,
  "problemClarity": <integer 0-100>,
  "targetAudienceFit": <integer 0-100>,
  "marketPotential": <integer 0-100>,
  "strengths": ["<string>", ...],
  "risks": ["<string>", ...],
  "nextSteps": ["<string>", ...],
  "summary": "<2-3 sentence executive summary>"
}

Scores represent directional AI assessments only — not verified market research or guarantees of commercial success.`
}

// ── Main export ───────────────────────────────────────────────────────────────

const TIMEOUT_MS = 30_000
const DEFAULT_MODEL = 'llama-3.3-70b-versatile'

/**
 * generateValidationReport — calls Groq and returns a validated report object.
 * Throws ConfigError, AIValidationError, or AIProviderError; never returns partial data.
 */
export async function generateValidationReport(idea) {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new ConfigError('AI provider is not configured. Set GROQ_API_KEY in server/.env')
  }

  const model = process.env.GROQ_MODEL || DEFAULT_MODEL

  const client = new Groq({ apiKey })

  // AbortController gives us a hard timeout independent of the SDK
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS)

  let raw
  try {
    const completion = await client.chat.completions.create(
      {
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a startup validation assistant. Always respond with valid JSON only.',
          },
          { role: 'user', content: buildPrompt(idea) },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
        max_tokens: 1024,
      },
      { signal: controller.signal }
    )
    raw = completion.choices[0]?.message?.content
  } catch (err) {
    if (err.name === 'AbortError' || err.code === 'ERR_CANCELED') {
      throw new AIProviderError('AI provider request timed out after 30 seconds')
    }
    // Surface Groq API errors without leaking keys or internal details
    const status = err.status ?? err.statusCode
    if (status === 401) throw new AIProviderError('AI provider rejected the API key')
    if (status === 429) throw new AIProviderError('AI provider rate limit reached — try again shortly')
    throw new AIProviderError(`AI provider error: ${err.message ?? 'unknown error'}`)
  } finally {
    clearTimeout(timer)
  }

  // ── Parse ──────────────────────────────────────────────────────────────────
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new AIValidationError('AI returned a non-JSON response')
  }

  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new AIValidationError('AI response was not a JSON object')
  }

  // ── Validate every field before returning anything ─────────────────────────
  const report = {
    overallScore:      requireScore(parsed.overallScore,      'overallScore'),
    problemClarity:    requireScore(parsed.problemClarity,    'problemClarity'),
    targetAudienceFit: requireScore(parsed.targetAudienceFit, 'targetAudienceFit'),
    marketPotential:   requireScore(parsed.marketPotential,   'marketPotential'),
    strengths:  requireStringArray(parsed.strengths,  'strengths'),
    risks:      requireStringArray(parsed.risks,      'risks'),
    nextSteps:  requireStringArray(parsed.nextSteps,  'nextSteps'),
    summary:    requireString(parsed.summary,         'summary'),
    generatedAt: new Date(),
  }

  return report
}
