import { api } from './client.js';

export const surveysApi = {
  list:   ()          => api.get('/surveys'),
  get:    (id)        => api.get(`/surveys/${id}`),
  create: (data)      => api.post('/surveys', data),
  update: (id, data)  => api.put(`/surveys/${id}`, data),
  remove: (id)        => api.del(`/surveys/${id}`),
};
