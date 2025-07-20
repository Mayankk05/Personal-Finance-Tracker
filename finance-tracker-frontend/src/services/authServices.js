import { apiHelper } from './api';

const authService = {
  // Login user
  login: async (credentials) => {
    try {
      const response = await apiHelper.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiHelper.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  // Token management
  setToken: (token) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  // User data management
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  removeUser: () => {
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = authService.getToken();
    const user = authService.getUser();
    return !!(token && user);
  },

  // Logout
  logout: () => {
    authService.removeToken();
    authService.removeUser();
  }
};

export default authService;