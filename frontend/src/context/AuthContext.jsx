import React, { createContext, useState, useEffect } from 'react';
import api from '../api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Validate token on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Auth verification failed:', err);
          handleLogout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  // Login handler
  const handleLogin = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, error: message };
    }
  };

  // Register handler
  const handleRegister = async (name, email, password, phone, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, phone, role });
      if (res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem('token', userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      const message = err.response?.data?.message || 'Registration failed.';
      return { success: false, error: errors ? errors.map(e => e.msg).join(', ') : message };
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // Update profile handler
  const handleUpdateProfile = async (profileData) => {
    try {
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        const updatedUser = res.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true };
      }
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateProfile: handleUpdateProfile,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
