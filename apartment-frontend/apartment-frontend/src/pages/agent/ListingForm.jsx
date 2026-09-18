import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { listingApi } from '../../api/listings'
import { resolveImage } from '../../components/ListingCard'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import PageLoader from '../../components/PageLoader'

const emptyForm = {
  title: '', description: '', price: '', bedrooms: '', bathrooms: '',
  sizeSqft: '', address: '', city: '', latitude: '', longitude: '', amenities: '',
}

export default function ListingForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [form, setForm] = useState(emptyForm)
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (!isEdit) return
    listingApi
      .getById(id)
      .then((data) => {
        setListing(data)
        setForm({
          title: data.title,
          description: data.description,
          price: data.price,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          sizeSqft: data.sizeSqft || '',
          address: data.address,
          city: data.city,
          latitude: data.latitude || '',
          longitude: data.longitude || '',
          amenities: data.amenities || '',
        })
      })
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [id, isEdit])

  function buildPayload() {
    return {
      ...form,
      price: Number(form.price),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      sizeSqft: form.sizeSqft ? Number(form.sizeSqft) : null,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      if (isEdit) {
        const updated = await listingApi.update(id, buildPayload())
        setListing(updated)
      } else {
        const created = await listingApi.create(buildPayload())
        navigate(`/agent/listings/${created.id}/edit`, { replace: true })
        return
      }
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    if (!file || !listing) return
    setUploading(true)
    setError('')
    try {
      await listingApi.uploadImage(listing.id, file, listing.images.length === 0)
      const refreshed = await listingApi.getById(listing.id)
      setListing(refreshed)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">{isEdit ? 'Edit listing' : 'New listing'}</h1>
      <p className="mt-1 text-sm text-slate-500">
        {isEdit ? 'Update the details for this apartment.' : 'Fill in the details, then add photos once it is created.'}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <ErrorBanner message={error} />

        <div>
          <label className="label">Title</label>
          <input required className="input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea required rows={4} className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <label className="label">Price (LKR)</label>
            <input required type="number" min="0" className="input" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
          <div>
            <label className="label">Bedrooms</label>
            <input required type="number" min="0" className="input" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
          </div>
          <div>
            <label className="label">Bathrooms</label>
            <input required type="number" min="0" className="input" value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })} />
          </div>
          <div>
            <label className="label">Size (sqft)</label>
            <input type="number" min="0" className="input" value={form.sizeSqft} onChange={(e) => setForm({ ...form, sizeSqft: e.target.value })} />
          </div>
          <div>
            <label className="label">Latitude (optional)</label>
            <input type="number" step="any" className="input" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} />
          </div>
          <div>
            <label className="label">Longitude (optional)</label>
            <input type="number" step="any" className="input" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Address</label>
          <input required className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </div>

        <div>
          <label className="label">City</label>
          <input required className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </div>

        <div>
          <label className="label">Amenities (comma-separated)</label>
          <input className="input" placeholder="Parking, Pool, Gym" value={form.amenities} onChange={(e) => setForm({ ...form, amenities: e.target.value })} />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Create listing'}
        </button>
      </form>

      {isEdit && listing && (
        <div className="mt-10 border-t border-slate-100 pt-8">
          <h2 className="font-display text-xl text-ink">Photos</h2>
          <p className="mt-1 text-sm text-slate-500">Upload photos of the apartment. The first one is used as the cover image.</p>

          <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
            {listing.images?.map((img) => (
              <div key={img.id} className="group relative">
                <img src={resolveImage(img.imageUrl)} alt="" className="h-24 w-full object-cover" />
                <button
                  type="button"
                  onClick={async () => {
                    await listingApi.deleteImage(listing.id, img.id)
                    const refreshed = await listingApi.getById(listing.id)
                    setListing(refreshed)
                  }}
                  className="absolute right-1 top-1 hidden h-6 w-6 items-center justify-center bg-white/90 text-xs text-red-600 group-hover:flex"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <label className="btn-outline mt-4 inline-flex cursor-pointer">
            {uploading ? 'Uploading...' : '+ Upload photo'}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
      )}
    </div>
  )
}
