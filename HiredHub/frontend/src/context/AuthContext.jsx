import { createContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api, { TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only wait on the network when a saved session might exist
  const [loading, setLoading] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    api.get('/auth/me')
      .then(({ data }) => setUser(data.user))
      .catch(() => {}) // a 401 is handled by the interceptor
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const onExpired = () => { setUser(null); toast.error('Your session expired. Please sign in again.'); };
    window.addEventListener('auth:expired', onExpired);
    return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const start = ({ token, user: u }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  };
  const login = async (payload) => start((await api.post('/auth/login', payload)).data);
  const register = async (payload) => start((await api.post('/auth/register', payload)).data);
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    toast.success('You have been signed out');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
