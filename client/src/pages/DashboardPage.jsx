import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-widest text-brand-500 uppercase">
          LaunchPad
        </span>
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
      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-500">
            Your startup ideas will appear here. Ideas &amp; AI validation coming in Phase 4.
          </p>
        </div>

        {/* Placeholder card */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white px-8 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50">
            <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-700">No ideas yet</p>
          <p className="mt-1 text-xs text-slate-400">Submit your first startup idea to get an AI validation report</p>
        </div>
      </main>
    </div>
  )
}
