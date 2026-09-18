export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <div className="flex items-center gap-3 text-slate-500">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-forest-500" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  )
}
