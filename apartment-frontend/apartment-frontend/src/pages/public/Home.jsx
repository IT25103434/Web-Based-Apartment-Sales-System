import { useEffect, useState } from 'react'
import { listingApi } from '../../api/listings'
import ListingCard from '../../components/ListingCard'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'

const emptyFilters = { keyword: '', city: '', minPrice: '', maxPrice: '', bedrooms: '', amenity: '' }

export default function Home() {
  const [filters, setFilters] = useState(emptyFilters)
  const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')

    const params = Object.fromEntries(
      Object.entries(appliedFilters).filter(([, value]) => value !== '' && value !== null)
    )
    params.status = 'AVAILABLE'

    listingApi
      .search(params)
      .then((data) => {
        if (!cancelled) setListings(data)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load listings.'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [appliedFilters])

  function handleSearchSubmit(e) {
    e.preventDefault()
    setAppliedFilters(filters)
  }

  function handleClear() {
    setFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-slate-100 bg-forest-800 text-forest-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="text-sm uppercase tracking-wide text-forest-200">Colombo &amp; suburbs</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-5xl">
            Find the apartment that fits how you actually live.
          </h1>
          <p className="mt-4 max-w-lg text-forest-100">
            Verified listings, straightforward inspection reports, and agents
            who reply - browse what's available right now.
          </p>

          <form
            onSubmit={handleSearchSubmit}
            className="mt-8 grid grid-cols-1 gap-3 bg-white p-4 shadow-sm sm:grid-cols-5"
          >
            <input
              className="input sm:col-span-2"
              placeholder="Search by title, area, address..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
            />
            <input
              className="input"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            />
            <select
              className="input"
              value={filters.bedrooms}
              onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
            >
              <option value="">Any beds</option>
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n}+ bed</option>
              ))}
            </select>
            <button type="submit" className="btn-gold">
              Search
            </button>
          </form>
        </div>
      </section>

      {/* Filters + results */}
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <input
              className="input w-32"
              type="number"
              placeholder="Min price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            />
            <input
              className="input w-32"
              type="number"
              placeholder="Max price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            />
            <input
              className="input w-40"
              placeholder="Amenity (e.g. Pool)"
              value={filters.amenity}
              onChange={(e) => setFilters({ ...filters, amenity: e.target.value })}
            />
            <button onClick={handleSearchSubmit} className="btn-outline">
              Apply
            </button>
            <button onClick={handleClear} className="btn-ghost">
              Clear
            </button>
          </div>
          <p className="text-sm text-slate-500">{listings.length} listing{listings.length === 1 ? '' : 's'}</p>
        </div>

        <ErrorBanner message={error} />

        {loading ? (
          <PageLoader label="Loading listings..." />
        ) : listings.length === 0 ? (
          <EmptyState
            title="No listings match your search"
            description="Try widening your filters, or clear them to see everything available."
            action={
              <button onClick={handleClear} className="btn-outline">
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
