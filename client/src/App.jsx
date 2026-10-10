import { BrowserRouter, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center max-w-xl px-6">
        <span className="inline-block text-xs font-semibold tracking-widest text-brand-500 uppercase mb-4">
          LaunchPad
        </span>
        <h1 className="text-5xl font-bold text-slate-900 mb-4 leading-tight">
          Validate your startup idea<br />before you build.
        </h1>
        <p className="text-slate-500 text-lg mb-8">
          Get AI-powered market analysis, competitive insights, and a viability
          score — in seconds.
        </p>
        <div className="flex gap-3 justify-center">
          <a
            href="/register"
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg transition-colors"
          >
            Get started free
          </a>
          <a
            href="/login"
            className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-medium rounded-lg transition-colors"
          >
            Sign in
          </a>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </BrowserRouter>
  )
}
