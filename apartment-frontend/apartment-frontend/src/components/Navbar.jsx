import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { notificationApi } from '../api/notifications'

const navLinkClass = ({ isActive }) =>
  `text-sm ${isActive ? 'text-forest-600 font-medium' : 'text-slate-600 hover:text-ink'}`

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!user) return
    notificationApi
      .getUnreadCount()
      .then((data) => setUnread(data.unread))
      .catch(() => {})
  }, [user])

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-paper/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-xl tracking-tight text-ink">
          Nestlyn
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <NavLink to="/" end className={navLinkClass}>
            Browse
          </NavLink>
          {user?.role === 'BUYER' && (
            <>
              <NavLink to="/buyer/favorites" className={navLinkClass}>
                Favorites
              </NavLink>
              <NavLink to="/buyer/bookings" className={navLinkClass}>
                Bookings
              </NavLink>
              <NavLink to="/buyer/leads" className={navLinkClass}>
                Inquiries
              </NavLink>
              <NavLink to="/buyer/saved-searches" className={navLinkClass}>
                Saved
              </NavLink>
              <NavLink to="/buyer/transactions" className={navLinkClass}>
                Deposits
              </NavLink>
            </>
          )}
          {user?.role === 'AGENT' && (
            <>
              <NavLink to="/agent/listings" className={navLinkClass}>
                My Listings
              </NavLink>
              <NavLink to="/agent/leads" className={navLinkClass}>
                Leads
              </NavLink>
              <NavLink to="/agent/bookings" className={navLinkClass}>
                Bookings
              </NavLink>
            </>
          )}
          {user?.role === 'ADMIN' && (
            <>
              <NavLink to="/admin/dashboard" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/admin/users" className={navLinkClass}>
                Users
              </NavLink>
              <NavLink to="/admin/reviews" className={navLinkClass}>
                Reviews
              </NavLink>
              <NavLink to="/admin/audit-logs" className={navLinkClass}>
                Audit Log
              </NavLink>
            </>
          )}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <>
              <NavLink to="/notifications" className="relative text-slate-600 hover:text-ink" aria-label="Notifications">
                <BellIcon />
                {unread > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center bg-gold-500 text-[10px] font-semibold text-ink">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                {user.fullName?.split(' ')[0]}
              </NavLink>
              <button onClick={handleLogout} className="btn-ghost !px-3 !py-1.5">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !px-3 !py-1.5">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-2">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          className="text-ink md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-paper px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            <NavLink to="/" end onClick={() => setMenuOpen(false)} className={navLinkClass}>
              Browse
            </NavLink>
            {user?.role === 'BUYER' && (
              <>
                <NavLink to="/buyer/favorites" onClick={() => setMenuOpen(false)} className={navLinkClass}>Favorites</NavLink>
                <NavLink to="/buyer/bookings" onClick={() => setMenuOpen(false)} className={navLinkClass}>Bookings</NavLink>
                <NavLink to="/buyer/leads" onClick={() => setMenuOpen(false)} className={navLinkClass}>Inquiries</NavLink>
                <NavLink to="/buyer/saved-searches" onClick={() => setMenuOpen(false)} className={navLinkClass}>Saved Searches</NavLink>
                <NavLink to="/buyer/transactions" onClick={() => setMenuOpen(false)} className={navLinkClass}>Transactions</NavLink>
              </>
            )}
            {user?.role === 'AGENT' && (
              <>
                <NavLink to="/agent/listings" onClick={() => setMenuOpen(false)} className={navLinkClass}>My Listings</NavLink>
                <NavLink to="/agent/leads" onClick={() => setMenuOpen(false)} className={navLinkClass}>Leads</NavLink>
                <NavLink to="/agent/bookings" onClick={() => setMenuOpen(false)} className={navLinkClass}>Bookings</NavLink>
              </>
            )}
            {user?.role === 'ADMIN' && (
              <>
                <NavLink to="/admin/dashboard" onClick={() => setMenuOpen(false)} className={navLinkClass}>Dashboard</NavLink>
                <NavLink to="/admin/users" onClick={() => setMenuOpen(false)} className={navLinkClass}>Users</NavLink>
                <NavLink to="/admin/reviews" onClick={() => setMenuOpen(false)} className={navLinkClass}>Reviews</NavLink>
                <NavLink to="/admin/audit-logs" onClick={() => setMenuOpen(false)} className={navLinkClass}>Audit Log</NavLink>
              </>
            )}
            <div className="mt-2 flex items-center gap-3 border-t border-slate-100 pt-3">
              {user ? (
                <>
                  <NavLink to="/notifications" onClick={() => setMenuOpen(false)} className={navLinkClass}>
                    Notifications {unread > 0 ? `(${unread})` : ''}
                  </NavLink>
                  <NavLink to="/profile" onClick={() => setMenuOpen(false)} className={navLinkClass}>Profile</NavLink>
                  <button onClick={handleLogout} className="text-sm text-slate-600">Log out</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="text-sm text-slate-600">Log in</Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="text-sm text-forest-600">Get started</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13.73 21a2 2 0 01-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
