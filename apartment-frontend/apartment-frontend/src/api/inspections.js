import api, { unwrap } from './axios'

export const inspectionApi = {
  getForListing: (listingId) => unwrap(api.get(`/listings/${listingId}/inspections`)),
  getById: (id) => unwrap(api.get(`/inspections/${id}`)),
  create: (payload) => unwrap(api.post('/inspections', payload)),
  addPhoto: (id, file, caption) => {
    const formData = new FormData()
    formData.append('file', file)
    return unwrap(
      api.post(`/inspections/${id}/photos`, formData, {
        params: caption ? { caption } : {},
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    )
  },
  // Returns a blob URL the browser can open/download directly.
  downloadPdf: async (id) => {
    const response = await api.get(`/inspections/${id}/pdf`, { responseType: 'blob' })
    return window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }))
  },
}
