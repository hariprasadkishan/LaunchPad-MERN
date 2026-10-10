import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteIdea, getIdea } from '../services/ideaService'

const STATUS_STYLES = {
  draft:     'bg-slate-100 text-slate-600',
  validated: 'bg-green-50 text-green-700',
  rejected:  'bg-red-50 text-red-600',
}

function Section({ label, children }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">{label}</p>
      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{children}</p>
    </div>
  )
}

export default function IdeaDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [idea, setIdea]         = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getIdea(id)
      .then(setIdea)
      .catch(() => setError("Idea not found or you don't have access to it."))
      .finally(() => setLoading(false))
  }, [id])

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

  if (error) {
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

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 px-8 py-8">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-6">
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{idea.title}</h1>
            <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[idea.status] ?? STATUS_STYLES.draft}`}>
              {idea.status}
            </span>
          </div>

          {/* Fields */}
          <div className="flex flex-col gap-6 mb-8">
            <Section label="Problem statement">{idea.problem}</Section>
            <Section label="Target audience">{idea.targetAudience}</Section>
            <Section label="Proposed solution">{idea.solution}</Section>
          </div>

          <p className="text-xs text-slate-400 mb-6">Created {createdAt}</p>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              to={`/ideas/${id}/edit`}
              className="flex-1 py-2.5 text-center bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
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
