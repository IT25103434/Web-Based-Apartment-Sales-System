import { useEffect, useState } from 'react'
import { leadApi } from '../../api/search'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime } from '../../utils/format'

export default function MyLeads() {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    leadApi
      .getMine()
      .then(setLeads)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your inquiries</h1>
      <p className="mt-1 text-sm text-slate-500">Messages you've sent to agents, and where things stand.</p>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : leads.length === 0 ? (
          <EmptyState title="No inquiries yet" description="Message an agent from a listing's page to start a conversation." action={<Link to="/" className="btn-outline">Browse listings</Link>} />
        ) : (
          <ul className="flex flex-col gap-3">
            {leads.map((lead) => (
              <li key={lead.id} className="border border-slate-100 bg-white p-4">
                <div className="flex items-center justify-between">
                  <Link to={`/listings/${lead.listing.id}`} className="font-medium text-ink hover:text-forest-600">
                    {lead.listing.title}
                  </Link>
                  <StatusBadge status={lead.stage} />
                </div>
                <p className="mt-1 text-xs text-slate-400">Agent: {lead.agent.fullName} · Updated {formatDateTime(lead.updatedAt)}</p>
                {lead.communicationLog && (
                  <pre className="mt-3 whitespace-pre-wrap border border-slate-100 bg-slate-50 p-3 font-sans text-xs text-slate-600">
                    {lead.communicationLog}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
