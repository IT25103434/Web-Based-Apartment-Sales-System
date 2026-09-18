import { useEffect, useState } from 'react'
import { adminApi } from '../../api/admin'
import PageLoader from '../../components/PageLoader'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'
import StatusBadge from '../../components/StatusBadge'
import { formatDate } from '../../utils/format'

const ROLES = ['BUYER', 'AGENT', 'ADMIN']

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    load()
  }, [])

  function load() {
    setLoading(true)
    adminApi
      .getUsers()
      .then(setUsers)
      .catch((err) => setError(extractErrorMessage(err)))
      .finally(() => setLoading(false))
  }

  async function handleSuspend(id) {
    try {
      await adminApi.suspendUser(id)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handleActivate(id) {
    try {
      await adminApi.activateUser(id)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  async function handleRoleChange(id, role) {
    if (!window.confirm(`Change this user's role to ${role}?`)) return
    try {
      await adminApi.updateUserRole(id, role)
      load()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Users</h1>
      <p className="mt-1 text-sm text-slate-500">Manage accounts, roles, and suspensions.</p>

      <ErrorBanner message={error} />

      <div className="mt-8 overflow-x-auto border border-slate-100 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-3">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-500">{u.email}</td>
                <td className="px-4 py-3">
                  <select
                    className="input !w-auto !py-1"
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.status === 'ACTIVE' ? (
                    <button onClick={() => handleSuspend(u.id)} className="text-xs text-red-600 hover:underline">
                      Suspend
                    </button>
                  ) : (
                    <button onClick={() => handleActivate(u.id)} className="text-xs text-forest-600 hover:underline">
                      Activate
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
