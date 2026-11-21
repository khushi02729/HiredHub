import api, { TOKEN_KEY } from './api';

export const updateProfile = (body) => api.put('/profile', body).then((r) => r.data.user);
export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append('avatar', file);
  return api.post('/profile/avatar', fd).then((r) => r.data.user);
};
export const changePassword = (body) => api.put('/profile/password', body).then((r) => {
  if (r.data.token) localStorage.setItem(TOKEN_KEY, r.data.token);
  return r.data;
});
