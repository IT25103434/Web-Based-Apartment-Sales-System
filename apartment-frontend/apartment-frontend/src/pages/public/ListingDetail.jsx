import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { listingApi } from '../../api/listings'
import { reviewApi } from '../../api/reviews'
import { favoriteApi, leadApi } from '../../api/search'
import { bookingApi } from '../../api/bookings'
import { inspectionApi } from '../../api/inspections'
import { transactionApi } from '../../api/transactions'
import { useAuth } from '../../context/AuthContext'
import { resolveImage } from '../../components/ListingCard'
import { formatPrice, formatDate, toIsoString } from '../../utils/format'
import PageLoader from '../../components/PageLoader'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import RatingStars from '../../components/RatingStars'
import Modal from '../../components/Modal'

export default function ListingDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [reviews, setReviews] = useState([])
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [inspections, setInspections] = useState([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [activeModal, setActiveModal] = useState(null) // 'booking' | 'review' | 'inquiry' | 'deposit'

  const isOwnerAgent = user?.role === 'AGENT' && listing && listing.agentId === user.id

  const loadAll = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const listingData = await listingApi.getById(id)
      setListing(listingData)

      const [reviewData, summaryData, inspectionData] = await Promise.all([
        reviewApi.getForListing(id).catch(() => []),
        reviewApi.getSummary(id).catch(() => ({ averageRating: 0, totalReviews: 0 })),
        inspectionApi.getForListing(id).catch(() => []),
      ])
      setReviews(reviewData)
      setRatingSummary(summaryData)
      setInspections(inspectionData)

      if (user?.role === 'BUYER') {
        const favorites = await favoriteApi.getMine().catch(() => [])
        setIsFavorite(favorites.some((f) => f.listing.id === Number(id)))
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load this listing.'))
    } finally {
      setLoading(false)
    }
  }, [id, user])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  async function toggleFavorite() {
    try {
      if (isFavorite) {
        await favoriteApi.remove(id)
        setIsFavorite(false)
      } else {
        await favoriteApi.add(id)
        setIsFavorite(true)
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handleStatusChange(status) {
    try {
      const updated = await listingApi.updateStatus(id, status)
      setListing(updated)
      setNotice('Listing status updated.')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    try {
      await listingApi.remove(id)
      navigate('/agent/listings')
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (loading) return <PageLoader label="Loading listing..." />
  if (!listing) return <div className="mx-auto max-w-3xl px-4 py-16"><ErrorBanner message={error || 'Listing not found.'} /></div>

  const images = listing.images && listing.images.length > 0 ? listing.images.map((img) => img.imageUrl) : [null]
  const amenities = listing.amenities ? listing.amenities.split(',').map((a) => a.trim()).filter(Boolean) : []

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {notice && <div className="mb-4 border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-700">{notice}</div>}
      <ErrorBanner message={error} />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: images + details */}
        <div className="lg:col-span-2">
          <div className="border border-slate-100">
            <img
              src={resolveImage(images[activeImage])}
              alt={listing.title}
              className="h-80 w-full object-cover sm:h-[420px]"
            />
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto p-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`h-16 w-20 flex-shrink-0 overflow-hidden border-2 ${
                      activeImage === i ? 'border-forest-500' : 'border-transparent'
                    }`}
                  >
                    <img src={resolveImage(img)} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-display text-3xl text-ink">{listing.title}</h1>
                <StatusBadge status={listing.status} />
              </div>
              <p className="mt-1 text-slate-500">{listing.address}, {listing.city}</p>
            </div>
            <p className="whitespace-nowrap font-display text-2xl text-gold-600">{formatPrice(listing.price)}</p>
          </div>

          <div className="mt-6 flex gap-6 border-y border-slate-100 py-4 text-sm text-slate-600">
            <span>{listing.bedrooms} bedrooms</span>
            <span>{listing.bathrooms} bathrooms</span>
            {listing.sizeSqft && <span>{listing.sizeSqft} sqft</span>}
          </div>

          <div className="mt-6">
            <h2 className="font-display text-xl text-ink">About this property</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">{listing.description}</p>
          </div>

          {amenities.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-xl text-ink">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {amenities.map((a) => (
                  <span key={a} className="border border-slate-200 px-3 py-1 text-xs text-slate-600">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* Inspection reports */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl text-ink">Inspection reports</h2>
              {isOwnerAgent && (
                <Link to={`/agent/inspections/new/${listing.id}`} className="text-sm text-forest-600 hover:underline">
                  + New inspection
                </Link>
              )}
            </div>
            {inspections.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No inspection report has been published for this listing yet.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-2">
                {inspections.map((insp) => (
                  <li key={insp.id} className="flex items-center justify-between border border-slate-100 px-4 py-3 text-sm">
                    <div>
                      <p className="text-ink">Inspection on {formatDate(insp.createdAt)}</p>
                      <p className="text-slate-500">Overall condition: {insp.overallScore}/10</p>
                    </div>
                    <DownloadPdfButton inspectionId={insp.id} />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Reviews */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl text-ink">Reviews</h2>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                  <RatingStars rating={ratingSummary.averageRating} />
                  <span>{ratingSummary.averageRating} ({ratingSummary.totalReviews} review{ratingSummary.totalReviews === 1 ? '' : 's'})</span>
                </div>
              </div>
              {user?.role === 'BUYER' && (
                <button onClick={() => setActiveModal('review')} className="btn-outline !py-1.5 !text-xs">
                  Write a review
                </button>
              )}
            </div>

            {reviews.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">No published reviews yet.</p>
            ) : (
              <ul className="mt-4 flex flex-col gap-4">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between">
                      <RatingStars rating={r.rating} />
                      <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-slate-600">{r.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: agent card + actions */}
        <aside className="flex flex-col gap-4">
          <div className="border border-slate-100 p-5">
            <p className="text-xs uppercase tracking-wide text-slate-400">Listed by</p>
            <p className="mt-1 font-display text-lg text-ink">{listing.agentName}</p>
            {listing.agentPhone && <p className="mt-1 text-sm text-slate-500">{listing.agentPhone}</p>}
          </div>

          {user?.role === 'BUYER' && (
            <div className="flex flex-col gap-2 border border-slate-100 p-5">
              <button onClick={() => setActiveModal('booking')} className="btn-primary w-full">
                Book a site visit
              </button>
              <button onClick={() => setActiveModal('inquiry')} className="btn-outline w-full">
                Message the agent
              </button>
              <button onClick={toggleFavorite} className="btn-ghost w-full">
                {isFavorite ? '★ Remove favorite' : '☆ Save to favorites'}
              </button>
              <button onClick={() => setActiveModal('deposit')} className="btn-gold w-full">
                Reserve with a deposit
              </button>
            </div>
          )}

          {!user && (
            <div className="border border-slate-100 p-5 text-sm text-slate-500">
              <Link to="/login" className="text-forest-600 hover:underline">Log in</Link> as a buyer to book a
              visit, save this listing, or contact the agent.
            </div>
          )}

          {isOwnerAgent && (
            <div className="flex flex-col gap-2 border border-slate-100 p-5">
              <p className="text-xs uppercase tracking-wide text-slate-400">Manage this listing</p>
              <Link to={`/agent/listings/${listing.id}/edit`} className="btn-outline w-full">
                Edit listing
              </Link>
              <select
                className="input"
                value={listing.status}
                onChange={(e) => handleStatusChange(e.target.value)}
              >
                <option value="AVAILABLE">Available</option>
                <option value="PENDING">Pending</option>
                <option value="SOLD">Sold</option>
              </select>
              <button onClick={handleDelete} className="btn-danger w-full">
                Delete listing
              </button>
            </div>
          )}
        </aside>
      </div>

      {activeModal === 'booking' && (
        <BookingModal listing={listing} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); setNotice('Visit requested - the agent will confirm shortly.') }} />
      )}
      {activeModal === 'inquiry' && (
        <InquiryModal listing={listing} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); setNotice('Your message was sent to the agent.') }} />
      )}
      {activeModal === 'review' && (
        <ReviewModal listing={listing} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); setNotice('Thanks - your review was submitted for moderation.') }} />
      )}
      {activeModal === 'deposit' && (
        <DepositModal listing={listing} onClose={() => setActiveModal(null)} onDone={() => { setActiveModal(null); setNotice('Deposit recorded (simulated payment). A receipt was emailed to you.') }} />
      )}
    </div>
  )
}

function DownloadPdfButton({ inspectionId }) {
  const [loading, setLoading] = useState(false)
  async function handleDownload() {
    setLoading(true)
    try {
      const url = await inspectionApi.downloadPdf(inspectionId)
      window.open(url, '_blank')
    } finally {
      setLoading(false)
    }
  }
  return (
    <button onClick={handleDownload} disabled={loading} className="btn-outline !py-1.5 !text-xs">
      {loading ? 'Preparing...' : 'View PDF report'}
    </button>
  )
}

function BookingModal({ listing, onClose, onDone }) {
  const [scheduledAt, setScheduledAt] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await bookingApi.create({ listingId: listing.id, scheduledAt: toIsoString(scheduledAt), notes })
      onDone()
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not book this slot - it may already be taken.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Book a site visit" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <div>
          <label className="label" htmlFor="scheduledAt">Preferred date & time</label>
          <input
            id="scheduledAt"
            type="datetime-local"
            required
            className="input"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="notes">Notes for the agent (optional)</label>
          <textarea
            id="notes"
            rows={3}
            className="input"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Requesting...' : 'Request booking'}
        </button>
      </form>
    </Modal>
  )
}

function InquiryModal({ listing, onClose, onDone }) {
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await leadApi.create({ listingId: listing.id, message })
      onDone()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Message the agent" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <div>
          <label className="label" htmlFor="message">Your message</label>
          <textarea
            id="message"
            rows={4}
            required
            className="input"
            placeholder="Hi, is this apartment still available?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Sending...' : 'Send message'}
        </button>
      </form>
    </Modal>
  )
}

function ReviewModal({ listing, onClose, onDone }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await reviewApi.create({ listingId: listing.id, rating, comment })
      onDone()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Write a review" onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <div>
          <span className="label">Rating</span>
          <div className="flex gap-1 text-2xl text-gold-500">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)} aria-label={`${n} stars`}>
                {n <= rating ? '★' : '☆'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label" htmlFor="comment">Comment (optional)</label>
          <textarea
            id="comment"
            rows={4}
            className="input"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-400">Reviews are checked by an admin before they appear publicly.</p>
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit review'}
        </button>
      </form>
    </Modal>
  )
}

function DepositModal({ listing, onClose, onDone }) {
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await transactionApi.create({ listingId: listing.id, amount: Number(amount) })
      onDone()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal title="Reserve with a deposit" onClose={onClose}>
      <div className="mb-4 border border-gold-200 bg-gold-50 px-3 py-2 text-xs text-gold-800">
        This is a simulated payment for demo purposes - no real payment gateway
        is connected. A record is created and a receipt is emailed to you.
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <ErrorBanner message={error} />
        <div>
          <label className="label" htmlFor="amount">Deposit amount (LKR)</label>
          <input
            id="amount"
            type="number"
            min="1"
            step="0.01"
            required
            className="input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full">
          {loading ? 'Processing...' : 'Confirm simulated payment'}
        </button>
      </form>
    </Modal>
  )
}
