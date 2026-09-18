import { useEffect, useState } from 'react'
import { leadApi } from '../../api/search'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime } from '../../utils/format'

const STAGES = ['INQUIRY', 'INSPECTION', 'NEGOTIATION', 'CLOSED']

export default function AgentLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteDrafts, setNoteDrafts] = useState({})

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    leadApi
      .getMine()
      .then(setLeads)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  async function handleStageChange(lead, stage) {
    try {
      const note = noteDrafts[lead.id] || ''
      const updated = await leadApi.updateStage(lead.id, { stage, note })
      setLeads((prev) => prev.map((l) => (l.id === lead.id ? updated : l)))
      setNoteDrafts((prev) => ({ ...prev, [lead.id]: '' }))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Leads</h1>
      <p className="mt-1 text-sm text-slate-500">Buyer inquiries about your listings, tracked through your pipeline.</p>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : leads.length === 0 ? (
          <EmptyState title="No leads yet" description="When a buyer messages you about a listing, it will show up here." />
        ) : (
          <ul className="flex flex-col gap-4">
            {leads.map((lead) => (
              <li key={lead.id} className="border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Link to={`/listings/${lead.listing.id}`} className="font-medium text-ink hover:text-forest-600">
                      {lead.listing.title}
                    </Link>
                    <p className="text-xs text-slate-500">Buyer: {lead.buyer.fullName} ({lead.buyer.email})</p>
                  </div>
                  <StatusBadge status={lead.stage} />
                </div>

                {lead.communicationLog && (
                  <pre className="mt-3 whitespace-pre-wrap border border-slate-100 bg-slate-50 p-3 font-sans text-xs text-slate-600">
                    {lead.communicationLog}
                  </pre>
                )}
                <p className="mt-1 text-xs text-slate-400">Last updated {formatDateTime(lead.updatedAt)}</p>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <input
                    className="input flex-1"
                    placeholder="Add a note (optional)"
                    value={noteDrafts[lead.id] || ''}
                    onChange={(e) => setNoteDrafts((prev) => ({ ...prev, [lead.id]: e.target.value }))}
                  />
                  <select
                    className="input sm:w-48"
                    value={lead.stage}
                    onChange={(e) => handleStageChange(lead, e.target.value)}
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
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
