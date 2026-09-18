import api, { unwrap } from './axios'

export const bookingApi = {
  getMine: () => unwrap(api.get('/bookings')),
  getAvailability: (agentId, date) => unwrap(api.get('/bookings/availability', { params: { agentId, date } })),
  create: (payload) => unwrap(api.post('/bookings', payload)),
  updateStatus: (id, status) => unwrap(api.put(`/bookings/${id}/status`, { status })),
  cancel: (id) => unwrap(api.delete(`/bookings/${id}`)),
}
