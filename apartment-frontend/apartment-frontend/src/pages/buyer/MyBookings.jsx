import { useEffect, useState } from 'react'
import { bookingApi } from '../../api/bookings'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime } from '../../utils/format'

export default function MyBookings() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    bookingApi
      .getMine()
      .then(setBookings)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  async function handleCancel(id) {
    if (!window.confirm('Cancel this booking?')) return
    try {
      await bookingApi.cancel(id)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your site visits</h1>
      <p className="mt-1 text-sm text-slate-500">Bookings you've made to view apartments.</p>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : bookings.length === 0 ? (
          <EmptyState title="No bookings yet" description="Book a site visit from a listing's page to see it here." action={<Link to="/" className="btn-outline">Browse listings</Link>} />
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link to={`/listings/${b.listing.id}`} className="font-medium text-ink hover:text-forest-600">
                    {b.listing.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">{formatDateTime(b.scheduledAt)}</p>
                  {b.notes && <p className="mt-1 text-xs text-slate-400">"{b.notes}"</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                    <button onClick={() => handleCancel(b.id)} className="text-sm text-red-600 hover:underline">Cancel</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
