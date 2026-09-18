import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listingApi } from '../../api/listings'
import ListingCard from '../../components/ListingCard'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'

export default function MyListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    listingApi
      .getMine()
      .then(setListings)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">My listings</h1>
          <p className="mt-1 text-sm text-slate-500">Manage the apartments you've listed for sale.</p>
        </div>
        <Link to="/agent/listings/new" className="btn-primary">+ New listing</Link>
      </div>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : listings.length === 0 ? (
          <EmptyState
            title="You haven't listed anything yet"
            description="Create your first listing to start receiving inquiries and bookings."
            action={<Link to="/agent/listings/new" className="btn-primary">Create a listing</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} showStatus />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
