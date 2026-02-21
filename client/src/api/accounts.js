import { api } from './client.js';

export const accountsApi = {
  list:   ()          => api.get('/accounts'),
  get:    (id)        => api.get(`/accounts/${id}`),
  create: (data)      => api.post('/accounts', data),
  update: (id, data)  => api.put(`/accounts/${id}`, data),
  remove: (id)        => api.del(`/accounts/${id}`),
};
