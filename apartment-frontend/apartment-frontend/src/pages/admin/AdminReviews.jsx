import { useEffect, useState } from 'react'
import { reviewApi } from '../../api/reviews'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import RatingStars from '../../components/RatingStars'
import { formatDate } from '../../utils/format'

export default function AdminReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    reviewApi
      .getPending()
      .then(setReviews)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  async function handleModerate(id, status) {
    try {
      await reviewApi.moderate(id, status)
      setReviews((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Review moderation</h1>
      <p className="mt-1 text-sm text-slate-500">Approve or reject reviews before they appear publicly.</p>

      <ErrorBanner message={error} />

      <div className="mt-8">
        {reviews.length === 0 ? (
          <EmptyState title="No pending reviews" description="You're all caught up." />
        ) : (
          <ul className="flex flex-col gap-4">
            {reviews.map((r) => (
              <li key={r.id} className="border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Link to={`/listings/${r.listing.id}`} className="font-medium text-ink hover:text-forest-600">
                    {r.listing.title}
                  </Link>
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">By {r.buyer.fullName}</p>
                <RatingStars rating={r.rating} />
                {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                <div className="mt-3 flex gap-3">
                  <button onClick={() => handleModerate(r.id, 'APPROVED')} className="btn-primary !py-1.5 !text-xs">
                    Approve
                  </button>
                  <button onClick={() => handleModerate(r.id, 'REJECTED')} className="btn-danger !py-1.5 !text-xs">
                    Reject
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
