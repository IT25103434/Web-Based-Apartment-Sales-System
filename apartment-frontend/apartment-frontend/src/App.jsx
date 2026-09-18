import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'

import Home from './pages/public/Home'
import ListingDetail from './pages/public/ListingDetail'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import Favorites from './pages/buyer/Favorites'
import SavedSearches from './pages/buyer/SavedSearches'
import MyBookings from './pages/buyer/MyBookings'
import MyLeads from './pages/buyer/MyLeads'
import MyTransactions from './pages/buyer/MyTransactions'

import MyListings from './pages/agent/MyListings'
import ListingForm from './pages/agent/ListingForm'
import AgentLeads from './pages/agent/AgentLeads'
import AgentBookings from './pages/agent/AgentBookings'
import InspectionForm from './pages/agent/InspectionForm'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminReviews from './pages/admin/AdminReviews'
import AdminAuditLogs from './pages/admin/AdminAuditLogs'

import Profile from './pages/shared/Profile'
import Notifications from './pages/shared/Notifications'
import NotFound from './pages/shared/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/listings/:id" element={<ListingDetail />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Shared (any logged-in role) */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Buyer */}
        <Route path="/buyer/favorites" element={<ProtectedRoute roles={['BUYER']}><Favorites /></ProtectedRoute>} />
        <Route path="/buyer/saved-searches" element={<ProtectedRoute roles={['BUYER']}><SavedSearches /></ProtectedRoute>} />
        <Route path="/buyer/bookings" element={<ProtectedRoute roles={['BUYER']}><MyBookings /></ProtectedRoute>} />
        <Route path="/buyer/leads" element={<ProtectedRoute roles={['BUYER']}><MyLeads /></ProtectedRoute>} />
        <Route path="/buyer/transactions" element={<ProtectedRoute roles={['BUYER']}><MyTransactions /></ProtectedRoute>} />

        {/* Agent */}
        <Route path="/agent/listings" element={<ProtectedRoute roles={['AGENT']}><MyListings /></ProtectedRoute>} />
        <Route path="/agent/listings/new" element={<ProtectedRoute roles={['AGENT']}><ListingForm /></ProtectedRoute>} />
        <Route path="/agent/listings/:id/edit" element={<ProtectedRoute roles={['AGENT']}><ListingForm /></ProtectedRoute>} />
        <Route path="/agent/leads" element={<ProtectedRoute roles={['AGENT']}><AgentLeads /></ProtectedRoute>} />
        <Route path="/agent/bookings" element={<ProtectedRoute roles={['AGENT']}><AgentBookings /></ProtectedRoute>} />
        <Route path="/agent/inspections/new/:listingId" element={<ProtectedRoute roles={['AGENT']}><InspectionForm /></ProtectedRoute>} />

        {/* Admin */}
        <Route path="/admin/dashboard" element={<ProtectedRoute roles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute roles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute roles={['ADMIN']}><AdminReviews /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute roles={['ADMIN']}><AdminAuditLogs /></ProtectedRoute>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
