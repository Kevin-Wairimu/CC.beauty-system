import React, { createContext, useState, useContext } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      // Check sessionStorage (tab-specific) first
      const sessionInfo = sessionStorage.getItem('userInfo');
      if (sessionInfo) return JSON.parse(sessionInfo);

      // Fallback to localStorage (persistent) for new tabs
      const localInfo = localStorage.getItem('userInfo');
      if (localInfo) {
        // Pin it to this tab's session so future changes in other tabs don't affect this one
        sessionStorage.setItem('userInfo', localInfo);
        return JSON.parse(localInfo);
      }
      return null;
    } catch (error) {
      console.error("Failed to parse userInfo from storage", error);
      return null;
    }
  });

  const loading = false;

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    sessionStorage.setItem('userInfo', JSON.stringify(data));
  };

  const loginWithGoogle = async (idToken) => {
    const { data } = await api.post('/auth/google', { idToken });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    sessionStorage.setItem('userInfo', JSON.stringify(data));
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    sessionStorage.setItem('userInfo', JSON.stringify(data));
  };

  const updateProfile = async (profileData) => {
    const { data } = await api.put('/auth/profile', profileData);
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    sessionStorage.setItem('userInfo', JSON.stringify(data));
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    sessionStorage.removeItem('userInfo');
    // Force a clean state and redirect
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register, loginWithGoogle, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
