export default function InputField({ label, id, error, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        id={id}
        className={`px-3.5 py-2.5 rounded-lg border text-sm bg-white outline-none transition-colors
          focus:ring-2 focus:ring-brand-500 focus:border-brand-500
          ${error ? 'border-red-400' : 'border-slate-200 hover:border-slate-300'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  )
}
