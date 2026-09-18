import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { userApi } from '../../api/users'
import ErrorBanner, { extractErrorMessage } from '../../components/ErrorBanner'

export default function Profile() {
  const { user, updateStoredUser } = useAuth()
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone || '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '' })
  const [pwdSaving, setPwdSaving] = useState(false)
  const [pwdError, setPwdError] = useState('')
  const [pwdNotice, setPwdNotice] = useState('')

  async function handleProfileSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSaving(true)
    try {
      const updated = await userApi.updateProfile(form)
      updateStoredUser(updated)
      setNotice('Profile updated.')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPwdError('')
    setPwdNotice('')
    setPwdSaving(true)
    try {
      await userApi.changePassword(pwdForm)
      setPwdNotice('Password changed.')
      setPwdForm({ currentPassword: '', newPassword: '' })
    } catch (err) {
      setPwdError(extractErrorMessage(err))
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl text-ink">Your profile</h1>
      <p className="mt-1 text-sm text-slate-500">{user.email} · {user.role}</p>

      <form onSubmit={handleProfileSubmit} className="mt-8 flex flex-col gap-4 border border-slate-100 bg-white p-5">
        <h2 className="font-display text-lg text-ink">Profile details</h2>
        <ErrorBanner message={error} />
        {notice && <p className="text-sm text-forest-600">{notice}</p>}
        <div>
          <label className="label">Full name</label>
          <input required className="input" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        </div>
        <div>
          <label className="label">Phone</label>
          <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </div>
        <button type="submit" disabled={saving} className="btn-primary self-start">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>

      <form onSubmit={handlePasswordSubmit} className="mt-6 flex flex-col gap-4 border border-slate-100 bg-white p-5">
        <h2 className="font-display text-lg text-ink">Change password</h2>
        <ErrorBanner message={pwdError} />
        {pwdNotice && <p className="text-sm text-forest-600">{pwdNotice}</p>}
        <div>
          <label className="label">Current password</label>
          <input type="password" required className="input" value={pwdForm.currentPassword} onChange={(e) => setPwdForm({ ...pwdForm, currentPassword: e.target.value })} />
        </div>
        <div>
          <label className="label">New password</label>
          <input type="password" required minLength={6} className="input" value={pwdForm.newPassword} onChange={(e) => setPwdForm({ ...pwdForm, newPassword: e.target.value })} />
        </div>
        <button type="submit" disabled={pwdSaving} className="btn-outline self-start">
          {pwdSaving ? 'Saving...' : 'Change password'}
        </button>
      </form>
    </div>
  )
}
