const STYLES = {
  AVAILABLE: 'bg-forest-50 text-forest-600',
  PENDING: 'bg-gold-50 text-gold-700',
  SOLD: 'bg-slate-100 text-slate-600',
  CONFIRMED: 'bg-forest-50 text-forest-600',
  CANCELLED: 'bg-red-50 text-red-600',
  COMPLETED: 'bg-slate-100 text-slate-600',
  APPROVED: 'bg-forest-50 text-forest-600',
  REJECTED: 'bg-red-50 text-red-600',
  ACTIVE: 'bg-forest-50 text-forest-600',
  SUSPENDED: 'bg-red-50 text-red-600',
  SUCCESS: 'bg-forest-50 text-forest-600',
  FAILED: 'bg-red-50 text-red-600',
  INQUIRY: 'bg-slate-100 text-slate-600',
  INSPECTION: 'bg-gold-50 text-gold-700',
  NEGOTIATION: 'bg-forest-50 text-forest-600',
  CLOSED: 'bg-slate-100 text-slate-600',
}

export default function StatusBadge({ status }) {
  const style = STYLES[status] || 'bg-slate-100 text-slate-600'
  return <span className={`badge ${style}`}>{status}</span>
}
