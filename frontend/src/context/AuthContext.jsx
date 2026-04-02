import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Load User
   * Checks for an existing access token on mount. If found, 
   * it fetches the latest user profile from the backend.
   */
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await authAPI.getMe();
      setUser(data.data); // Backend response contains user object in data.data
    } catch (err) {
      // If the token is invalid or the session expired, clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial authentication check on app load
  useEffect(() => {
    loadUser();
  }, [loadUser]);

  /**
   * Login Function
   * Handles the manual email/password login flow.
   */
  const login = async (credentials) => {
    const { data } = await authAPI.login(credentials);
    const { accessToken, refreshToken, user: userData } = data.data;

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    setUser(userData);
    return userData;
  };

  /**
   * Logout Function
   * Clears tokens from the database (via API) and locally.
   */
  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      if (refreshToken) {
        await authAPI.logout(refreshToken);
      }
    } catch (error) {
      console.warn("Logout request failed, clearing local state anyway.");
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  /**
   * Update User
   * Used to refresh the local user state after profile edits.
   */
  const updateUser = (updatedUser) => {
    setUser((prev) => (prev ? { ...prev, ...updatedUser } : updatedUser));
  };

  // Derived states for easy use in components
  const isAdmin = user?.role === 'admin';
  const isAuthenticated = !!user;

  const value = {
    user,
    loading,
    isAdmin,
    isAuthenticated,
    login,
    logout,
    updateUser,
    loadUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to Auth context
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};