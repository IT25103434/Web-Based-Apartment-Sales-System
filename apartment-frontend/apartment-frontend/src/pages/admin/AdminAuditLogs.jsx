import { useEffect, useState } from 'react'
import { adminApi } from '../../api/admin'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import { formatDateTime } from '../../utils/format'

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    adminApi
      .getAuditLogs()
      .then(setLogs)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Audit log</h1>
      <p className="mt-1 text-sm text-slate-500">A record of admin actions (suspending users, changing roles, etc.).</p>

      <ErrorBanner message={error} />

      <div className="mt-8">
        {logs.length === 0 ? (
          <EmptyState title="No admin actions recorded yet" />
        ) : (
          <ul className="flex flex-col gap-2">
            {logs.map((log) => (
              <li key={log.id} className="border border-slate-100 bg-white p-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink">{log.action}</span>
                  <span className="text-xs text-slate-400">{formatDateTime(log.createdAt)}</span>
                </div>
                <p className="mt-1 text-slate-500">{log.details}</p>
                <p className="mt-1 text-xs text-slate-400">By {log.admin.fullName}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
