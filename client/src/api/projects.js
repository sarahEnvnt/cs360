import { api } from './client.js';

export const projectsApi = {
  list:   (accountId)          => api.get(`/accounts/${accountId}/projects`),
  create: (accountId, data)    => api.post(`/accounts/${accountId}/projects`, data),
  update: (accountId, id, data) => api.put(`/accounts/${accountId}/projects/${id}`, data),
  remove: (accountId, id)      => api.del(`/accounts/${accountId}/projects/${id}`),
};
