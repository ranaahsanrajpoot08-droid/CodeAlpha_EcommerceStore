import api from './api';

export const createOrder = (data) => api.post('/orders', data).then((r) => r.data.order);
export const getMyOrders = () => api.get('/orders/my-orders').then((r) => r.data.orders);
export const getOrder = (id) => api.get(`/orders/${id}`).then((r) => r.data.order);

// Admin
export const getAllOrders = (status) =>
  api.get('/admin/orders', { params: status ? { status } : {} }).then((r) => r.data.orders);
export const updateOrderStatus = (id, status) =>
  api.put(`/admin/orders/${id}/status`, { status }).then((r) => r.data.order);
