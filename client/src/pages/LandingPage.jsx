import { Link } from 'react-router-dom'

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-50 via-white to-slate-50 px-4">
      <div className="text-center max-w-xl">
        <span className="inline-block text-xs font-semibold tracking-widest text-brand-500 uppercase mb-6">
          LaunchPad
        </span>
        <h1 className="text-5xl font-bold text-slate-900 mb-5 leading-tight">
          Validate your startup idea<br />before you build.
        </h1>
        <p className="text-slate-500 text-lg mb-10 leading-relaxed">
          Get AI-powered market analysis, competitive insights, and a viability
          score — in seconds.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            to="/register"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
          >
            Get started free
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
