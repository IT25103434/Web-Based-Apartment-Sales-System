import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { listingApi } from '../../api/listings'
import { inspectionApi } from '../../api/inspections'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import PageLoader from '../../components/PageLoader'

const emptyItem = { category: '', description: '', conditionScore: 8, remarks: '' }
const CATEGORY_OPTIONS = ['Structural', 'Electrical', 'Plumbing', 'Aesthetic', 'Appliances', 'Safety']

export default function InspectionForm() {
  const { listingId } = useParams()
  const navigate = useNavigate()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generalNotes, setGeneralNotes] = useState('')
  const [items, setItems] = useState([{ ...emptyItem }])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [created, setCreated] = useState(null)

  useEffect(() => {
    listingApi
      .getById(listingId)
      .then(setListing)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [listingId])

  function updateItem(index, field, value) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  function addItem() {
    setItems((prev) => [...prev, { ...emptyItem }])
  }

  function removeItem(index) {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const payload = {
        listingId: Number(listingId),
        generalNotes,
        items: items.map((item) => ({ ...item, conditionScore: Number(item.conditionScore) })),
      }
      const inspection = await inspectionApi.create(payload)
      setCreated(inspection)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  if (created) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-display text-2xl text-ink">Inspection report created</h1>
        <p className="mt-2 text-sm text-slate-500">
          Overall condition score: {created.overallScore}/10
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <DownloadButton inspectionId={created.id} />
          <Link to={`/listings/${listingId}`} className="btn-outline">Back to listing</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">New inspection report</h1>
      {listing && <p className="mt-1 text-sm text-slate-500">For: {listing.title}</p>}

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
        <ErrorBanner message={error} />

        <div className="flex flex-col gap-4">
          {items.map((item, index) => (
            <div key={index} className="border border-slate-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-ink">Checklist item {index + 1}</p>
                {items.length > 1 && (
                  <button type="button" onClick={() => removeItem(index)} className="text-xs text-red-600 hover:underline">
                    Remove
                  </button>
                )}
              </div>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="label">Category</label>
                  <select
                    className="input"
                    required
                    value={item.category}
                    onChange={(e) => updateItem(index, 'category', e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Condition score (1-10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    className="input"
                    value={item.conditionScore}
                    onChange={(e) => updateItem(index, 'conditionScore', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Description</label>
                  <input
                    required
                    className="input"
                    placeholder="e.g. Kitchen sink and taps"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Remarks (optional)</label>
                  <input
                    className="input"
                    placeholder="e.g. Minor leak, recommend replacing washer"
                    value={item.remarks}
                    onChange={(e) => updateItem(index, 'remarks', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="btn-outline self-start">
            + Add checklist item
          </button>
        </div>

        <div>
          <label className="label">General notes / repair recommendations</label>
          <textarea
            rows={4}
            className="input"
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
          />
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving...' : 'Create inspection report'}
        </button>
      </form>
    </div>
  )
}

function DownloadButton({ inspectionId }) {
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
    <button onClick={handleDownload} disabled={loading} className="btn-gold">
      {loading ? 'Preparing...' : 'Download PDF report'}
    </button>
  )
}
