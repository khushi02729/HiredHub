import api from './api';

export const getMyJobs = () => api.get('/jobs/mine').then((r) => r.data.jobs);
export const createJob = (body) => api.post('/jobs', body).then((r) => r.data.job);
export const updateJob = (id, body) => api.put(`/jobs/${id}`, body).then((r) => r.data.job);
export const deleteJob = (id) => api.delete(`/jobs/${id}`);
export const getRecruiterAnalytics = () => api.get('/analytics/recruiter').then((r) => r.data);
