import api from './api';

export const getJobs = (params) => api.get('/jobs', { params }).then((r) => r.data);
export const getJob = (id) => api.get(`/jobs/${id}`).then((r) => r.data.job);
export const getFilterOptions = () => api.get('/jobs/filters/options').then((r) => r.data);
export const getStats = () => api.get('/jobs/stats/summary').then((r) => r.data.stats);
export const saveJob = (id) => api.post(`/saved/${id}`);
export const unsaveJob = (id) => api.delete(`/saved/${id}`);
