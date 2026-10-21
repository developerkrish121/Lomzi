import { apiClient } from '@/lib/apiClient';

const unwrap = (request) => request.then(({ data }) => data);

export const adminApi = {
  dashboard: () => unwrap(apiClient.get('/admin/dashboard')).then((data) => data.dashboard),
  products: (params) => unwrap(apiClient.get('/admin/products', { params })),
  product: (id) => unwrap(apiClient.get(`/admin/products/${id}`)).then((data) => data.product),
  createProduct: (body) =>
    unwrap(apiClient.post('/admin/products', body)).then((data) => data.product),
  updateProduct: ({ id, body }) =>
    unwrap(apiClient.patch(`/admin/products/${id}`, body)).then((data) => data.product),
  deleteProduct: (id) =>
    unwrap(apiClient.delete(`/admin/products/${id}`)).then((data) => data.product),
  updateStock: ({ id, stock }) =>
    unwrap(apiClient.patch(`/admin/products/${id}/stock`, { stock })).then((data) => data.product),
  toggleProduct: (id) =>
    unwrap(apiClient.patch(`/admin/products/${id}/toggle`)).then((data) => data.product),
  categories: (params) => unwrap(apiClient.get('/admin/categories', { params })),
  createCategory: (body) =>
    unwrap(apiClient.post('/admin/categories', body)).then((data) => data.category),
  updateCategory: ({ id, body }) =>
    unwrap(apiClient.patch(`/admin/categories/${id}`, body)).then((data) => data.category),
  deleteCategory: (id) => unwrap(apiClient.delete(`/admin/categories/${id}`)),
  orders: (params) => unwrap(apiClient.get('/admin/orders', { params })),
  order: (id) => unwrap(apiClient.get(`/admin/orders/${id}`)).then((data) => data.order),
  updateOrderStatus: ({ id, status }) =>
    unwrap(apiClient.patch(`/admin/orders/${id}/status`, { status })).then((data) => data.order),
};

export const adminError = (error) =>
  error.response?.data?.error?.message || 'Unable to complete this admin action.';
