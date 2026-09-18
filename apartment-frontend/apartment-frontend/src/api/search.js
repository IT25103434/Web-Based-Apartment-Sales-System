import api, { unwrap } from './axios'

export const favoriteApi = {
  getMine: () => unwrap(api.get('/favorites')),
  add: (listingId) => unwrap(api.post(`/favorites/${listingId}`)),
  remove: (listingId) => unwrap(api.delete(`/favorites/${listingId}`)),
}

export const savedSearchApi = {
  getMine: () => unwrap(api.get('/saved-searches')),
  create: (payload) => unwrap(api.post('/saved-searches', payload)),
  update: (id, payload) => unwrap(api.put(`/saved-searches/${id}`, payload)),
  remove: (id) => unwrap(api.delete(`/saved-searches/${id}`)),
}

export const leadApi = {
  getMine: () => unwrap(api.get('/leads')),
  getById: (id) => unwrap(api.get(`/leads/${id}`)),
  create: (payload) => unwrap(api.post('/leads', payload)),
  updateStage: (id, payload) => unwrap(api.put(`/leads/${id}/stage`, payload)),
}
