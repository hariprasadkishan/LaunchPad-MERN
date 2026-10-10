import { Link } from 'react-router-dom'

const STATUS_STYLES = {
  draft:     'bg-slate-100 text-slate-600',
  validated: 'bg-green-50 text-green-700',
  rejected:  'bg-red-50 text-red-600',
}

export default function IdeaCard({ idea, onDelete }) {
  const date = new Date(idea.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-slate-900 leading-snug line-clamp-2">{idea.title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_STYLES[idea.status] ?? STATUS_STYLES.draft}`}>
          {idea.status}
        </span>
      </div>

      {/* Problem snippet */}
      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{idea.problem}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-50">
        <span className="text-xs text-slate-400">{date}</span>
        <div className="flex items-center gap-2">
          <Link
            to={`/ideas/${idea._id}`}
            className="text-xs text-slate-500 hover:text-slate-700 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            View
          </Link>
          <Link
            to={`/ideas/${idea._id}/edit`}
            className="text-xs text-brand-500 hover:text-brand-600 font-medium px-3 py-1.5 rounded-lg hover:bg-brand-50 transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={() => onDelete(idea)}
            className="text-xs text-red-500 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
