import api from './api';

// formData: jobId, coverLetter, and either `resume` (file) or `resumeId`
export const applyToJob = (formData) => api.post('/applications', formData).then((r) => r.data.application);
export const getMyApplications = () => api.get('/applications').then((r) => r.data.applications);
export const updateApplicationStatus = (id, body) => api.patch(`/applications/${id}/status`, body).then((r) => r.data.application);
export const updateApplication = (id, body) => api.patch(`/applications/${id}`, body).then((r) => r.data.application);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);
export const setShortlisted = (id, shortlisted) => api.patch(`/applications/${id}/shortlist`, { shortlisted }).then((r) => r.data.application);
export const getApplicants = (jobId) => api.get(`/applications/job/${jobId}`).then((r) => r.data);
