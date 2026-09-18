import { useEffect, useState } from 'react'
import { notificationApi } from '../../api/notifications'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import { formatDateTime } from '../../utils/format'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    notificationApi
      .getMine()
      .then(setNotifications)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  async function handleMarkRead(id) {
    try {
      await notificationApi.markAsRead(id)
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Notifications</h1>

      <ErrorBanner message={error} />

      <div className="mt-8">
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" />
        ) : (
          <ul className="flex flex-col gap-2">
            {notifications.map((n) => (
              <li
                key={n.id}
                className={`border p-4 text-sm ${n.isRead ? 'border-slate-100 bg-white' : 'border-forest-200 bg-forest-50'}`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-ink">{n.title}</p>
                  <span className="text-xs text-slate-400">{formatDateTime(n.createdAt)}</span>
                </div>
                <p className="mt-1 text-slate-600">{n.message}</p>
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n.id)} className="mt-2 text-xs text-forest-600 hover:underline">
                    Mark as read
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
