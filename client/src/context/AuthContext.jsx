import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set axios default headers
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get('http://localhost:5000/api/auth/me');
        setUser(res.data.data);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
        setError(err.response?.data?.message || 'An error occurred');
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  };

  // Login user
  const login = async (userData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', userData);
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      return res.data;
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  // Clear errors
  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
