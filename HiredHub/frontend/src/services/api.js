import axios from 'axios';

export const TOKEN_KEY = 'hiredhub_token';

const api = axios.create({ baseURL: `${import.meta.env.VITE_API_URL || ''}/api` });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Only token problems end the session. A wrong "current password" is also a 4xx and must not.
const TOKEN_ERROR = /not authenticated|invalid or expired token|no longer exists/i;
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || '';
    if (err.response?.status === 401 && TOKEN_ERROR.test(message) && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event('auth:expired'));
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback = 'Something went wrong. Please try again.') => {
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.request && !err.response) return 'Cannot reach the server. Check your connection and try again.';
  return fallback;
};

export default api;
