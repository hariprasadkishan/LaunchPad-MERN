import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/ui/InputField'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [fields, setFields] = useState({ email: '', password: '' })
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    if (!fields.email || !fields.password) {
      setServerError('Email and password are required')
      return
    }
    setLoading(true)
    try {
      await login(fields.email, fields.password)
      navigate('/dashboard')
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-xs font-semibold tracking-widest text-brand-500 uppercase">
            LaunchPad
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <InputField
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={set('email')}
              placeholder="jane@example.com"
            />
            <InputField
              label="Password"
              id="password"
              type="password"
              autoComplete="current-password"
              value={fields.password}
              onChange={set('password')}
              placeholder="Your password"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-500 hover:text-brand-600 font-medium">
            Get started free
          </Link>
        </p>
      </div>
    </div>
  )
}
