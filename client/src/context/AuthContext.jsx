import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cs360_token');
    if (!token) { setLoading(false); return; }
    authApi.getMe()
      .then(u => setUser(u))
      .catch(() => localStorage.removeItem('cs360_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { token, user } = await authApi.login(email, password);
    localStorage.setItem('cs360_token', token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('cs360_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
