import api, { unwrap } from './axios'

export const transactionApi = {
  getMine: () => unwrap(api.get('/transactions/mine')),
  create: (payload) => unwrap(api.post('/transactions', payload)),
}
