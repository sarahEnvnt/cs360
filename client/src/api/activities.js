import { api } from './client.js';

export const activitiesApi = {
  list:   (accountId)          => api.get(`/accounts/${accountId}/activities`),
  create: (accountId, data)    => api.post(`/accounts/${accountId}/activities`, data),
  update: (accountId, id, data) => api.put(`/accounts/${accountId}/activities/${id}`, data),
  remove: (accountId, id)      => api.del(`/accounts/${accountId}/activities/${id}`),
};
