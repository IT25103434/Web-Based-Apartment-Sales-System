import { useEffect, useState } from 'react'
import { transactionApi } from '../../api/transactions'
import { Link } from 'react-router-dom'
import PageLoader from '../../components/PageLoader'
import EmptyState from '../../components/EmptyState'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatDateTime, formatPrice } from '../../utils/format'

export default function MyTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    transactionApi
      .getMine()
      .then(setTransactions)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your deposits</h1>
      <p className="mt-1 text-sm text-slate-500">
        A record of reservation deposits you've made. These are simulated
        payments for demo purposes - no real payment gateway is connected.
      </p>

      <div className="mt-8">
        <ErrorBanner message={error} />
        {loading ? (
          <PageLoader />
        ) : transactions.length === 0 ? (
          <EmptyState title="No transactions yet" description="Reserve a listing with a deposit from its page to see a record here." action={<Link to="/" className="btn-outline">Browse listings</Link>} />
        ) : (
          <table className="w-full border border-slate-100 bg-white text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Listing</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/listings/${t.listing.id}`} className="text-forest-600 hover:underline">
                      {t.listing.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{formatPrice(t.amount)}</td>
                  <td className="px-4 py-3 font-mono text-xs">{t.reference}</td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3 text-slate-500">{formatDateTime(t.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
