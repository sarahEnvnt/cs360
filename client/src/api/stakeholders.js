import { api } from './client.js';

export const stakeholdersApi = {
  list:   (accountId)          => api.get(`/accounts/${accountId}/stakeholders`),
  create: (accountId, data)    => api.post(`/accounts/${accountId}/stakeholders`, data),
  update: (accountId, id, data) => api.put(`/accounts/${accountId}/stakeholders/${id}`, data),
  remove: (accountId, id)      => api.del(`/accounts/${accountId}/stakeholders/${id}`),
};
