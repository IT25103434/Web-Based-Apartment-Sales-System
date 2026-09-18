import api, { unwrap } from './axios'

export const notificationApi = {
  getMine: () => unwrap(api.get('/notifications')),
  getUnreadCount: () => unwrap(api.get('/notifications/unread-count')),
  markAsRead: (id) => unwrap(api.put(`/notifications/${id}/read`)),
}
