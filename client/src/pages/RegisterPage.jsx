import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import InputField from '../components/ui/InputField'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [fields, setFields] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  function validate() {
    const e = {}
    if (!fields.name.trim()) e.name = 'Name is required'
    if (!fields.email.trim()) e.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(fields.email)) e.email = 'Enter a valid email'
    if (!fields.password) e.password = 'Password is required'
    else if (fields.password.length < 8) e.password = 'Password must be at least 8 characters'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }
    setErrors({})
    setLoading(true)
    try {
      await register(fields.name, fields.email, fields.password)
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
          <h1 className="mt-2 text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-1 text-sm text-slate-500">Start validating ideas in seconds</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <InputField
              label="Full name"
              id="name"
              type="text"
              autoComplete="name"
              value={fields.name}
              onChange={set('name')}
              error={errors.name}
              placeholder="Jane Smith"
            />
            <InputField
              label="Email"
              id="email"
              type="email"
              autoComplete="email"
              value={fields.email}
              onChange={set('email')}
              error={errors.email}
              placeholder="jane@example.com"
            />
            <InputField
              label="Password"
              id="password"
              type="password"
              autoComplete="new-password"
              value={fields.password}
              onChange={set('password')}
              error={errors.password}
              placeholder="At least 8 characters"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-500 hover:text-brand-600 font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
