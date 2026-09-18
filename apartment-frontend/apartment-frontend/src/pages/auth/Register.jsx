import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'

const initialForm = { fullName: '', email: '', password: '', phone: '', role: 'BUYER' }

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(form)
      navigate('/', { replace: true })
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create your account.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-16 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Create your account</h1>
      <p className="mt-2 text-sm text-slate-500">Browse as a buyer, or list properties as an agent.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <ErrorBanner message={error} />

        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            required
            className="input"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="phone">Phone</label>
          <input
            id="phone"
            className="input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>

        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <p className="mt-1 text-xs text-slate-400">At least 6 characters.</p>
        </div>

        <div>
          <span className="label">I want to...</span>
          <div className="grid grid-cols-2 gap-3">
            <RoleOption
              label="Browse & buy"
              description="Find and inquire about apartments"
              selected={form.role === 'BUYER'}
              onClick={() => setForm({ ...form, role: 'BUYER' })}
            />
            <RoleOption
              label="List properties"
              description="Manage listings as an agent"
              selected={form.role === 'AGENT'}
              onClick={() => setForm({ ...form, role: 'AGENT' })}
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="text-forest-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  )
}

function RoleOption({ label, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border px-3 py-3 text-left text-sm transition-colors ${
        selected ? 'border-forest-500 bg-forest-50' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <span className="block font-medium text-ink">{label}</span>
      <span className="block text-xs text-slate-500">{description}</span>
    </button>
  )
}
