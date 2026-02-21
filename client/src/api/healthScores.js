import { api } from './client.js';

export const healthApi = {
  list:   (accountId)       => api.get(`/accounts/${accountId}/health`),
  create: (accountId, data) => api.post(`/accounts/${accountId}/health`, data),
};
