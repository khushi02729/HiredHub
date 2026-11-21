import api from './api';

export const getSeekerAnalytics = () => api.get('/analytics/seeker').then((r) => r.data);
export const getRecommendations = (limit = 6) => api.get('/recommendations', { params: { limit } }).then((r) => r.data);
export const getJobMatch = (jobId) => api.get(`/recommendations/${jobId}`).then((r) => r.data.match);
export const getSavedJobs = () => api.get('/saved').then((r) => r.data.jobs);
