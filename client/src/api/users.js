import { api } from './client.js';

export const usersApi = {
  list:   ()          => api.get('/users'),
  names:  ()          => api.get('/users/names'),
  get:    (id)        => api.get(`/users/${id}`),
  create: (data)      => api.post('/users', data),
  update: (id, data)  => api.put(`/users/${id}`, data),
  remove: (id)        => api.del(`/users/${id}`),
};
