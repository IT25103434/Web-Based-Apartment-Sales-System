import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '../../api/auth'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await authApi.resetPassword({ token, newPassword })
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      setError(extractErrorMessage(err, 'This reset link may have expired.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Set a new password</h1>

      {!token && (
        <ErrorBanner message="This link is missing a reset token. Please use the link from your email." />
      )}

      {done ? (
        <div className="mt-6 border border-forest-200 bg-forest-50 px-4 py-3 text-sm text-forest-700">
          Password updated. Redirecting to login...
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
          <ErrorBanner message={error} />
          <div>
            <label className="label" htmlFor="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              required
              minLength={6}
              className="input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading || !token} className="btn-primary w-full">
            {loading ? 'Saving...' : 'Save new password'}
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="text-forest-600 hover:underline">
          Back to log in
        </Link>
      </p>
    </div>
  )
}
