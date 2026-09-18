import api, { unwrap } from './axios'

export const listingApi = {
  search: (params) => unwrap(api.get('/listings', { params })),
  getById: (id) => unwrap(api.get(`/listings/${id}`)),
  getMine: () => unwrap(api.get('/listings/mine')),
  create: (payload) => unwrap(api.post('/listings', payload)),
  update: (id, payload) => unwrap(api.put(`/listings/${id}`, payload)),
  updateStatus: (id, status) => unwrap(api.put(`/listings/${id}/status`, null, { params: { status } })),
  remove: (id) => unwrap(api.delete(`/listings/${id}`)),
  uploadImage: (id, file, primary = false) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(
      api.post(`/listings/${id}/images`, formData, {
        params: { primary },
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },
  deleteImage: (id, imageId) => unwrap(api.delete(`/listings/${id}/images/${imageId}`)),
}
