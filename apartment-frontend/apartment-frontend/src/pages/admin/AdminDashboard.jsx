import { useEffect, useState } from 'react'
import { adminApi } from '../../api/admin'
import PageLoader from '../../components/PageLoader'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import { formatPrice } from '../../utils/format'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi
      .getDashboard()
      .then(setStats)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const cards = stats && [
    { label: 'Total users', value: stats.totalUsers },
    { label: 'Buyers', value: stats.totalBuyers },
    { label: 'Agents', value: stats.totalAgents },
    { label: 'Total listings', value: stats.totalListings },
    { label: 'Available listings', value: stats.activeListings },
    { label: 'Total bookings', value: stats.totalBookings },
    { label: 'Pending reviews', value: stats.pendingReviews },
    { label: 'Total deposits collected', value: formatPrice(stats.totalDeposits) },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Admin dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">A snapshot of what's happening across the platform.</p>

      <ErrorBanner message={error} />

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="border border-slate-100 bg-white p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">{c.label}</p>
              <p className="mt-2 font-display text-2xl text-ink">{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
