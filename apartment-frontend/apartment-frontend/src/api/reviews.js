import api, { unwrap } from './axios'

export const reviewApi = {
  getForListing: (listingId) => unwrap(api.get(`/listings/${listingId}/reviews`)),
  getSummary: (listingId) => unwrap(api.get(`/listings/${listingId}/reviews/summary`)),
  create: (payload) => unwrap(api.post('/reviews', payload)),
  getPending: () => unwrap(api.get('/reviews/pending')),
  moderate: (id, status) => unwrap(api.put(`/reviews/${id}/moderate`, { status })),
}
