import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteIdea, getIdea, validateIdea } from '../services/ideaService'

// ── Design tokens ─────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  draft:     'bg-slate-100 text-slate-600',
  validated: 'bg-green-50 text-green-700',
  rejected:  'bg-red-50 text-red-600',
}

function scoreColor(n) {
  if (n >= 70) return 'text-green-600'
  if (n >= 45) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBarColor(n) {
  if (n >= 70) return 'bg-green-500'
  if (n >= 45) return 'bg-amber-400'
  return 'bg-red-400'
}

// ── Small reusable pieces ─────────────────────────────────────────────────────
function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  )
}

function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className={`text-xs font-semibold ${scoreColor(value)}`}>{value}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100">
        <div
          className={`h-1.5 rounded-full transition-all ${scoreBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

function BulletList({ items, emptyText }) {
  if (!items || items.length === 0) {
    return <p className="text-sm text-slate-400 italic">{emptyText}</p>
  }
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-slate-700">
          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
          {item}
        </li>
      ))}
    </ul>
  )
}

// ── Validation report block ───────────────────────────────────────────────────
function ValidationReport({ report }) {
  const generatedAt = new Date(report.generatedAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="mt-8 border-t border-slate-100 pt-8">
      {/* Disclaimer */}
      <div className="mb-6 flex items-start gap-2.5 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3">
        <svg className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
        </svg>
        <p className="text-xs text-amber-700 leading-relaxed">
          <span className="font-semibold">AI-generated assessment only.</span> Scores and insights are directional estimates from a language model, not verified market research, professional advice, or guarantees of commercial success.
        </p>
      </div>

      {/* Header + overall score */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-slate-900">Validation Report</h2>
        <div className="text-right">
          <span className={`text-3xl font-bold ${scoreColor(report.overallScore)}`}>
            {report.overallScore}
          </span>
          <span className="text-sm text-slate-400">/100</span>
          <p className="text-xs text-slate-400 mt-0.5">Overall score</p>
        </div>
      </div>

      {/* Sub-scores */}
      <div className="grid gap-3 mb-6">
        <ScoreBar label="Problem clarity"      value={report.problemClarity} />
        <ScoreBar label="Target audience fit"  value={report.targetAudienceFit} />
        <ScoreBar label="Market potential"     value={report.marketPotential} />
      </div>

      {/* Summary */}
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Summary</p>
        <p className="text-sm text-slate-700 leading-relaxed">{report.summary}</p>
      </div>

      {/* Three lists */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Strengths</p>
          <BulletList items={report.strengths} emptyText="No strengths identified" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Risks</p>
          <BulletList items={report.risks} emptyText="No risks identified" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Next steps</p>
          <BulletList items={report.nextSteps} emptyText="No next steps suggested" />
        </div>
      </div>

      <p className="mt-6 text-xs text-slate-400">Generated {generatedAt}</p>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function IdeaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [idea, setIdea]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [validating, setValidating] = useState(false)
  const [validateError, setValidateError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting]   = useState(false)

  useEffect(() => {
    getIdea(id)
      .then(setIdea)
      .catch(() => setError("Idea not found or you don't have access to it."))
      .finally(() => setLoading(false))
  }, [id])

  async function handleValidate() {
    setValidateError('')
    setValidating(true)
    try {
      const updated = await validateIdea(id)
      setIdea(updated)
    } catch (err) {
      setValidateError(err.response?.data?.message || 'Validation failed. Please try again.')
    } finally {
      setValidating(false)
    }
  }

  async function handleDelete() {
    setDeleting(true)
    try {
      await deleteIdea(id)
      navigate('/dashboard')
    } catch {
      setError('Failed to delete. Please try again.')
      setConfirmDelete(false)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  if (error && !idea) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-red-500">{error}</p>
        <Link to="/dashboard" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const createdAt = new Date(idea.createdAt).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Back */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to dashboard
        </Link>

        {/* Main card */}
        <div className="bg-white rounded-2xl border border-slate-100 px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{idea.title}</h1>
            <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[idea.status] ?? STATUS_STYLES.draft}`}>
              {idea.status}
            </span>
          </div>

          {/* Idea fields */}
          <div className="flex flex-col gap-6 mb-8">
            <Section label="Problem statement">{idea.problem}</Section>
            <Section label="Target audience">{idea.targetAudience}</Section>
            <Section label="Proposed solution">{idea.solution}</Section>
          </div>

          <p className="text-xs text-slate-400 mb-6">Created {createdAt}</p>

          {/* Validate error */}
          {validateError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {validateError}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleValidate}
              disabled={validating}
              className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              {validating ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z" />
                  </svg>
                  Analysing…
                </>
              ) : idea.validationReport ? 'Re-validate with AI' : 'Validate with AI'}
            </button>
            <Link
              to={`/ideas/${id}/edit`}
              className="flex-1 py-2.5 text-center border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              Edit idea
            </Link>
            <button
              onClick={() => setConfirmDelete(true)}
              className="flex-1 py-2.5 border border-slate-200 hover:border-red-200 hover:text-red-500 text-slate-600 text-sm font-medium rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>

          {/* Validation report — shown when available */}
          {idea.validationReport && <ValidationReport report={idea.validationReport} />}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Delete this idea?</h2>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-medium text-slate-700">"{idea.title}"</span> will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                disabled={deleting}
                className="flex-1 py-2 border border-slate-200 hover:border-slate-300 rounded-lg text-sm text-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
