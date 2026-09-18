import api, { unwrap } from './axios'

export const userApi = {
  getMe: () => unwrap(api.get('/users/me')),
  updateProfile: (payload) => unwrap(api.put('/users/me', payload)),
  changePassword: (payload) => unwrap(api.put('/users/me/password', payload)),
}
