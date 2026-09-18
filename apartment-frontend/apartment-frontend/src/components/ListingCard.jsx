import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format'
import StatusBadge from './StatusBadge'

const FALLBACK_IMAGE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">
      <rect width="400" height="300" fill="#EAF1EE"/>
      <text x="200" y="155" font-family="Inter, sans-serif" font-size="14" fill="#457D66" text-anchor="middle">No photo yet</text>
    </svg>`
  )

const API_ORIGIN = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api').replace(/\/api\/?$/, '')

function resolveImage(url) {
  if (!url) return FALLBACK_IMAGE
  if (url.startsWith('http')) return url
  return `${API_ORIGIN}${url}`
}

export default function ListingCard({ listing, showStatus = false, footer = null }) {
  const image = listing.images && listing.images.length > 0 ? listing.images[0].imageUrl : null

  return (
    <div className="group flex flex-col border border-slate-100 bg-white">
      <Link to={`/listings/${listing.id}`} className="block overflow-hidden">
        <img
          src={resolveImage(image)}
          alt={listing.title}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/listings/${listing.id}`}>
            <h3 className="font-display text-base leading-snug text-ink hover:text-forest-600">
              {listing.title}
            </h3>
          </Link>
          {showStatus && <StatusBadge status={listing.status} />}
        </div>
        <p className="text-sm text-slate-500">{listing.city}</p>
        <p className="text-sm text-slate-500">
          {listing.bedrooms} bed · {listing.bathrooms} bath
          {listing.sizeSqft ? ` · ${listing.sizeSqft} sqft` : ''}
        </p>
        <p className="mt-1 font-display text-lg text-gold-600">{formatPrice(listing.price)}</p>
        {footer}
      </div>
    </div>
  )
}

export { resolveImage, API_ORIGIN }
