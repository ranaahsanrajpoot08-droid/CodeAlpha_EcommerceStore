// One shared Axios instance. It adds the JWT token to every request
// (Authorization: Bearer <token>) so we don't repeat it everywhere.
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns any Axios error into a friendly message for the user
export const getErrorMessage = (err) => {
  if (err.response?.data?.message) return err.response.data.message;
  if (err.request) return 'Cannot reach the server. Please check that the backend is running.';
  return 'Something went wrong. Please try again.';
};

export default api;
