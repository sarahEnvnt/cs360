import { api } from './client.js';

export const responsesApi = {
  list:   (accountId)       => api.get(`/accounts/${accountId}/responses`),
  create: (accountId, data)      => api.post(`/accounts/${accountId}/responses`, data),
  update: (accountId, id, data)  => api.put(`/accounts/${accountId}/responses/${id}`, data),
  remove: (accountId, id)        => api.del(`/accounts/${accountId}/responses/${id}`),
};
