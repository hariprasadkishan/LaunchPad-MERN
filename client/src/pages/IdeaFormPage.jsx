import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import InputField from '../components/ui/InputField'
import { createIdea, getIdea, updateIdea } from '../services/ideaService'

const EMPTY = { title: '', problem: '', targetAudience: '', solution: '' }

function TextAreaField({ label, id, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">{label}</label>
      <textarea
        id={id}
        rows={4}
        className={`px-3.5 py-2.5 rounded-lg border text-sm bg-white outline-none resize-y transition-colors
          focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          ${error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}

export default function IdeaFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [fields, setFields]       = useState(EMPTY)
  const [errors, setErrors]       = useState({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading]     = useState(isEdit)   // loading prefill
  const [saving, setSaving]       = useState(false)

  // Prefill form when editing
  useEffect(() => {
    if (!isEdit) return
    getIdea(id)
      .then((idea) => {
        setFields({
          title: idea.title,
          problem: idea.problem,
          targetAudience: idea.targetAudience,
          solution: idea.solution,
        })
      })
      .catch(() => setServerError('Failed to load idea.'))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function validate() {
    const e = {}
    if (!fields.title.trim())          e.title          = 'Title is required'
    if (!fields.problem.trim())        e.problem        = 'Problem statement is required'
    if (!fields.targetAudience.trim()) e.targetAudience = 'Target audience is required'
    if (!fields.solution.trim())       e.solution       = 'Solution is required'
    return e
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setServerError('')
    const fieldErrors = validate()
    if (Object.keys(fieldErrors).length) { setErrors(fieldErrors); return }
    setErrors({})
    setSaving(true)
    try {
      if (isEdit) {
        await updateIdea(id, fields)
        navigate(`/ideas/${id}`)
      } else {
        const idea = await createIdea(fields)
        navigate(`/ideas/${idea._id}`)
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const set = (k) => (e) => setFields((f) => ({ ...f, [k]: e.target.value }))

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm text-slate-400">Loading…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4 py-10">
      <div className="max-w-xl mx-auto">
        {/* Back link */}
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to dashboard
        </Link>

        {/* Header */}
        <div className="mb-7">
          <span className="text-xs font-semibold tracking-widest text-brand-500 uppercase">LaunchPad</span>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            {isEdit ? 'Edit idea' : 'New idea'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEdit ? 'Update the details below.' : 'Describe your startup idea to get an AI validation report.'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 px-8 py-8">
          {serverError && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            <InputField
              label="Idea title"
              id="title"
              type="text"
              value={fields.title}
              onChange={set('title')}
              error={errors.title}
              placeholder="e.g. AI-powered meal planner for athletes"
            />
            <TextAreaField
              label="Problem statement"
              id="problem"
              value={fields.problem}
              onChange={set('problem')}
              error={errors.problem}
              placeholder="What problem does this solve? Who is affected and how?"
            />
            <TextAreaField
              label="Target audience"
              id="targetAudience"
              value={fields.targetAudience}
              onChange={set('targetAudience')}
              error={errors.targetAudience}
              placeholder="Who are your ideal customers?"
            />
            <TextAreaField
              label="Proposed solution"
              id="solution"
              value={fields.solution}
              onChange={set('solution')}
              error={errors.solution}
              placeholder="How does your idea solve the problem?"
            />

            <button
              type="submit"
              disabled={saving}
              className="mt-1 w-full py-2.5 bg-brand-500 hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors text-sm"
            >
              {saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save changes' : 'Create idea')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
