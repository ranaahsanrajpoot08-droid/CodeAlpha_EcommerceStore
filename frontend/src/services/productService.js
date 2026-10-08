import api from './api';

export const getProducts = (params = {}) => api.get('/products', { params }).then((r) => r.data.products);
export const getCategories = () => api.get('/products/categories').then((r) => r.data.categories);
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data.product);

// Admin
export const createProduct = (data) => api.post('/products', data).then((r) => r.data.product);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data.product);
export const deleteProduct = (id) => api.delete(`/products/${id}`).then((r) => r.data);
