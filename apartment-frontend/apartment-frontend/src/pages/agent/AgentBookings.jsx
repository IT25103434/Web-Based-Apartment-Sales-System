import { useEffect, useState } from 'react'
import { bookingApi } from '../../api/bookings'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime } from '../../utils/format'

export default function AgentBookings() {
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

  async function handleStatusChange(id, status) {
    try {
      await bookingApi.updateStatus(id, status)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Site visit requests</h1>
      <p className="mt-1 text-sm text-slate-500">Confirm, complete, or cancel bookings for your listings.</p>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : bookings.length === 0 ? (
          <EmptyState title="No booking requests yet" description="When a buyer books a visit to one of your listings, it will show up here." />
        ) : (
          <ul className="flex flex-col gap-3">
            {bookings.map((b) => (
              <li key={b.id} className="flex flex-col gap-2 border border-slate-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Link to={`/listings/${b.listing.id}`} className="font-medium text-ink hover:text-forest-600">
                    {b.listing.title}
                  </Link>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDateTime(b.scheduledAt)} · Buyer: {b.buyer.fullName} ({b.buyer.phone || b.buyer.email})
                  </p>
                  {b.notes && <p className="mt-1 text-xs text-slate-400">"{b.notes}"</p>}
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <select
                    className="input !w-auto"
                    value={b.status}
                    onChange={(e) => handleStatusChange(b.id, e.target.value)}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
