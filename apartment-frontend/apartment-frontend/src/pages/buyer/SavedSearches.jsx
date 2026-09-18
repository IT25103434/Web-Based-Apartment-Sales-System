import { useEffect, useState } from 'react'
import { savedSearchApi } from '../../api/search'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import Modal from '../../components/Modal'

const emptyForm = { label: '', keyword: '', minPrice: '', maxPrice: '', bedrooms: '', city: '', amenity: '' }

export default function SavedSearches() {
  const [searches, setSearches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    savedSearchApi
      .getMine()
      .then(setSearches)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  async function handleCreate(e) {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        ...form,
        minPrice: form.minPrice || null,
        maxPrice: form.maxPrice || null,
        bedrooms: form.bedrooms || null,
      }
      await savedSearchApi.create(payload)
      setShowForm(false)
      setForm(emptyForm)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this saved search?')) return
    try {
      await savedSearchApi.remove(id)
      setSearches((prev) => prev.filter((s) => s.id !== id))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  function searchLink(s) {
    const params = new URLSearchParams()
    if (s.keyword) params.set('keyword', s.keyword)
    if (s.city) params.set('city', s.city)
    if (s.minPrice) params.set('minPrice', s.minPrice)
    if (s.maxPrice) params.set('maxPrice', s.maxPrice)
    if (s.bedrooms) params.set('bedrooms', s.bedrooms)
    if (s.amenity) params.set('amenity', s.amenity)
    return `/?${params.toString()}`
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink">Saved searches</h1>
          <p className="mt-1 text-sm text-slate-500">Re-run a search without re-entering all the filters.</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Save a search</button>
      </div>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : searches.length === 0 ? (
          <EmptyState title="No saved searches yet" description="Save your filters here so you can quickly check back for new listings." />
        ) : (
          <ul className="flex flex-col gap-3">
            {searches.map((s) => (
              <li key={s.id} className="flex items-center justify-between border border-slate-100 bg-white p-4">
                <div>
                  <p className="font-medium text-ink">{s.label || 'Untitled search'}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {[
                      s.keyword && `"${s.keyword}"`,
                      s.city && `in ${s.city}`,
                      s.bedrooms && `${s.bedrooms}+ bed`,
                      s.minPrice && `min ${s.minPrice}`,
                      s.maxPrice && `max ${s.maxPrice}`,
                      s.amenity && `has ${s.amenity}`,
                    ].filter(Boolean).join(' · ') || 'No filters'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link to={searchLink(s)} className="text-sm text-forest-600 hover:underline">Run search</Link>
                  <button onClick={() => handleDelete(s.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {showForm && (
        <Modal title="Save a search" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <label className="label">Label</label>
              <input className="input" placeholder="e.g. Colombo apartments under 50M" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Keyword</label>
                <input className="input" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
              </div>
              <div>
                <label className="label">City</label>
                <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label className="label">Min price</label>
                <input type="number" className="input" value={form.minPrice} onChange={(e) => setForm({ ...form, minPrice: e.target.value })} />
              </div>
              <div>
                <label className="label">Max price</label>
                <input type="number" className="input" value={form.maxPrice} onChange={(e) => setForm({ ...form, maxPrice: e.target.value })} />
              </div>
              <div>
                <label className="label">Bedrooms</label>
                <input type="number" className="input" value={form.bedrooms} onChange={(e) => setForm({ ...form, bedrooms: e.target.value })} />
              </div>
              <div>
                <label className="label">Amenity</label>
                <input className="input" value={form.amenity} onChange={(e) => setForm({ ...form, amenity: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving...' : 'Save search'}</button>
          </form>
        </Modal>
      )}
    </div>
  )
}
