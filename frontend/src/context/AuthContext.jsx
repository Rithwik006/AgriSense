import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('agrisense_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('agrisense_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('agrisense_token');
      if (savedToken) {
        try {
          const userData = await getCurrentUser();
          setUser(userData);
          localStorage.setItem('agrisense_user', JSON.stringify(userData));
        } catch (err) {
          // Token expired or invalid
          console.warn('Session expired. Logging out.');
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const data = await loginUser({ email, password });
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('agrisense_token', data.access_token);
    localStorage.setItem('agrisense_user', JSON.stringify(data.user));
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setToken(data.access_token);
    setUser(data.user);
    localStorage.setItem('agrisense_token', data.access_token);
    localStorage.setItem('agrisense_user', JSON.stringify(data.user));
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('agrisense_token');
    localStorage.removeItem('agrisense_user');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
