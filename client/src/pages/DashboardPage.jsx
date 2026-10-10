import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getIdeas, deleteIdea } from '../services/ideaService'
import IdeaCard from '../components/ideas/IdeaCard'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [ideas, setIdeas]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [confirmDelete, setConfirmDelete] = useState(null)  // idea to delete
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getIdeas()
      .then(setIdeas)
      .catch(() => setError('Failed to load ideas. Please refresh.'))
      .finally(() => setLoading(false))
  }, [])

  function handleLogout() {
    logout()
    navigate('/')
  }

  async function handleDelete() {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      await deleteIdea(confirmDelete._id)
      setIdeas((prev) => prev.filter((i) => i._id !== confirmDelete._id))
      setConfirmDelete(null)
    } catch {
      setError('Failed to delete idea. Please try again.')
      setConfirmDelete(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-widest text-brand-500 uppercase">LaunchPad</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-600">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-sm px-4 py-1.5 border border-slate-200 hover:border-slate-300 rounded-lg text-slate-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {ideas.length > 0 ? `${ideas.length} idea${ideas.length > 1 ? 's' : ''} saved` : 'No ideas yet — add your first one'}
            </p>
          </div>
          <Link
            to="/ideas/new"
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New idea
          </Link>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3].map(n => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-6 animate-pulse">
                <div className="h-4 bg-slate-100 rounded w-3/4 mb-3" />
                <div className="h-3 bg-slate-100 rounded w-full mb-2" />
                <div className="h-3 bg-slate-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && ideas.length === 0 && !error && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-8 py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
              <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-700">No ideas yet</p>
            <p className="mt-1 text-xs text-slate-400">Submit your first startup idea to get started</p>
            <Link
              to="/ideas/new"
              className="mt-5 inline-block px-5 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Add your first idea
            </Link>
          </div>
        )}

        {/* Idea grid */}
        {!loading && ideas.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {ideas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} onDelete={setConfirmDelete} />
            ))}
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-2">Delete this idea?</h2>
            <p className="text-sm text-slate-500 mb-6">
              <span className="font-medium text-slate-700">"{confirmDelete.title}"</span> will be permanently deleted.
              This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
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
