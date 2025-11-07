import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API = process.env.REACT_APP_API || 'http://localhost:4000';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissions, setPermissions] = useState([]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        fetchPermissions(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const fetchPermissions = async (userData) => {
    if (!userData) return;
    try {
      const response = await axios.get(`${API}/api/admin/permissions`);
      setPermissions(response.data.capabilities || []);
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      const { accessToken, refreshToken, user: userData } = res.data;
      
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      await fetchPermissions(userData);
      
      return userData;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await axios.post(`${API}/api/auth/logout`, { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setPermissions([]);
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken');
      if (!refreshTokenValue) throw new Error('No refresh token');
      
      const res = await axios.post(`${API}/api/auth/refresh`, {
        refreshToken: refreshTokenValue
      });
      
      const { accessToken, user: userData } = res.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      return accessToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Axios interceptor for token refresh
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && user) {
          try {
            await refreshToken();
            return axios.request(error.config);
          } catch (refreshError) {
            logout();
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [user]);

  const hasPermission = (capability) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return permissions.includes(capability) || permissions.includes('*');
  };

  const value = {
    user,
    loading,
    login,
    logout,
    permissions,
    hasPermission,
    refreshToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default useAuth;
