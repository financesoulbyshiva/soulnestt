import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('soulnestt_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authService
      .me()
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem('soulnestt_token'))
      .finally(() => setLoading(false));
  }, []);

  const adopt = useCallback((data) => {
    localStorage.setItem('soulnestt_token', data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    (payload) => authService.login(payload).then(adopt),
    [adopt]
  );
  const loginAdmin = useCallback(
    (payload) => authService.loginAdmin(payload).then(adopt),
    [adopt]
  );
  const registerTenant = useCallback(
    (payload) => authService.registerTenant(payload).then(adopt),
    [adopt]
  );
  const registerOwner = useCallback(
    (payload) => authService.registerOwner(payload).then(adopt),
    [adopt]
  );
  const refresh = useCallback(() => authService.me().then((data) => setUser(data.user)), []);
  const logout = useCallback(() => {
    localStorage.removeItem('soulnestt_token');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, role: user?.role || null, loading, login, loginAdmin, registerTenant, registerOwner, refresh, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
