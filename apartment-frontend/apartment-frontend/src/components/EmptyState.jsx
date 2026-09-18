export default function EmptyState({ title, description, action }) {
  return (
    <div className="border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <h3 className="font-display text-lg text-ink">{title}</h3>
      {description && <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
