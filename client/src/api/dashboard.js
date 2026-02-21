import { api } from './client.js';

export const dashboardApi = {
  getKpis:              () => api.get('/dashboard/kpis'),
  getSummary:           () => api.get('/dashboard/summary'),
  getLatestHealth:      () => api.get('/dashboard/latest-health'),
  getUpcomingActivities:() => api.get('/dashboard/upcoming-activities'),
  getAllResponses:       () => api.get('/dashboard/all-responses'),
};
