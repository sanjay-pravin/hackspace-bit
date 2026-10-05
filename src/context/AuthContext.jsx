import React, { createContext, useContext, state, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initUser() {
      try {
        const current = await authService.getCurrentUser();
        setUser(current);
      } catch (err) {
        console.error('Failed to restore auth session:', err);
      } finally {
        setLoading(false);
      }
    }
    initUser();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const u = await authService.signIn(email, password);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginWithPcdp = async (email, password) => {
    setLoading(true);
    try {
      const u = await authService.signInWithPcdp({ email, password });
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (googleEmail = null) => {
    setLoading(true);
    try {
      const u = await authService.signInWithGoogle(googleEmail);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (data) => {
    setLoading(true);
    try {
      const u = await authService.signUp(data);
      setUser(u);
      return u;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.signOut();
    setUser(null);
  };

  const updateProfile = async (updates) => {
    if (!user) return;
    const updated = await authService.updateProfile(user.id, updates);
    setUser(updated);
    return updated;
  };

  const value = {
    user,
    loading,
    login,
    loginWithPcdp,
    loginWithGoogle,
    signup,
    logout,
    updateProfile,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'admin',
    isStudent: user?.role === 'student',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
