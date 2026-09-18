import api, { unwrap } from './axios'

export const adminApi = {
  getDashboard: () => unwrap(api.get('/admin/dashboard')),
  getUsers: () => unwrap(api.get('/admin/users')),
  suspendUser: (id) => unwrap(api.put(`/admin/users/${id}/suspend`)),
  activateUser: (id) => unwrap(api.put(`/admin/users/${id}/activate`)),
  updateUserRole: (id, role) => unwrap(api.put(`/admin/users/${id}/role`, { role })),
  getAuditLogs: () => unwrap(api.get('/admin/audit-logs')),
}
