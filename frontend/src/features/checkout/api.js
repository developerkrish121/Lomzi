import { apiClient } from '@/lib/apiClient';

export const checkoutApi = {
  getAddresses: () => apiClient.get('/addresses').then(({ data }) => data.addresses),
  createAddress: (input) => apiClient.post('/addresses', input).then(({ data }) => data.address),
  updateAddress: ({ id, input }) =>
    apiClient.patch(`/addresses/${id}`, input).then(({ data }) => data.address),
  deleteAddress: (id) => apiClient.delete(`/addresses/${id}`).then(({ data }) => data),
  placeOrder: (input) => apiClient.post('/orders', input).then(({ data }) => data.order),
  getOrders: () => apiClient.get('/orders').then(({ data }) => data.orders),
  getOrder: (id) => apiClient.get(`/orders/${id}`).then(({ data }) => data.order),
};
