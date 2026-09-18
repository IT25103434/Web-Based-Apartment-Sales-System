import { useEffect, useState } from 'react'
import { favoriteApi } from '../../api/search'
import ListingCard from '../../components/ListingCard'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import { Link } from 'react-router-dom'

export default function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    favoriteApi
      .getMine()
      .then(setFavorites)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  async function handleRemove(listingId) {
    try {
      await favoriteApi.remove(listingId)
      setFavorites((prev) => prev.filter((f) => f.listing.id !== listingId))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your favorites</h1>
      <p className="mt-1 text-sm text-slate-500">Listings you've saved to look at later.</p>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Browse listings and tap the favorite button to save them here."
            action={<Link to="/" className="btn-outline">Browse listings</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((f) => (
              <ListingCard
                key={f.id}
                listing={f.listing}
                showStatus
                footer={
                  <button onClick={() => handleRemove(f.listing.id)} className="mt-1 text-left text-xs text-red-600 hover:underline">
                    Remove from favorites
                  </button>
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
