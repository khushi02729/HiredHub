import api from './api';

const form = (file) => { const fd = new FormData(); fd.append('resume', file); return fd; };

export const getResumes = () => api.get('/resumes').then((r) => r.data.resumes);
export const uploadResume = (file) => api.post('/resumes', form(file)).then((r) => r.data.resume);
export const replaceResume = (id, file) => api.put(`/resumes/${id}`, form(file)).then((r) => r.data.resume);
export const setPrimaryResume = (id) => api.patch(`/resumes/${id}/primary`).then((r) => r.data.resume);
export const deleteResume = (id) => api.delete(`/resumes/${id}`);

// Files are served only to authorised users, so they are fetched with the auth header as a blob.
// PDFs open in a new tab; Word files download.
export async function openResume(resume, { download = false } = {}) {
  const preview = !download && resume.mimeType === 'application/pdf';
  const win = preview ? window.open('', '_blank') : null; // opened first so the popup blocker allows it
  try {
    const res = await api.get(`/resumes/${resume._id}/download`, { responseType: 'blob', params: preview ? { inline: 1 } : {} });
    const url = URL.createObjectURL(new Blob([res.data], { type: resume.mimeType }));
    if (preview && win) {
      win.location.href = url;
    } else {
      const a = document.createElement('a');
      a.href = url; a.download = resume.originalName;
      document.body.appendChild(a); a.click(); a.remove();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (err) {
    if (win) win.close();
    if (err.response?.data instanceof Blob) {
      try { err.response.data = JSON.parse(await err.response.data.text()); } catch { /* keep generic message */ }
    }
    throw err;
  }
}
