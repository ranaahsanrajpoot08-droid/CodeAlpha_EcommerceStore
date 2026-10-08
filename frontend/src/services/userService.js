import api from './api';

export const getProfile = () => api.get('/users/profile').then((r) => r.data.user);
export const updateProfile = (data) => api.put('/users/profile', data).then((r) => r.data.user);

// Admin
export const getAllUsers = () => api.get('/admin/users').then((r) => r.data.users);
export const getAdminStats = () => api.get('/admin/stats').then((r) => r.data);
