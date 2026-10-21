import { apiClient } from '@/lib/apiClient';

const cartFrom = ({ data }) => ({
  items: data.items,
  subtotal: data.subtotal,
  totalItems: data.totalItems,
});

export const cartApi = {
  get: () => apiClient.get('/cart').then(cartFrom),
  addItem: (input) => apiClient.post('/cart/items', input).then(cartFrom),
  updateItem: ({ id, quantity }) =>
    apiClient.patch(`/cart/items/${id}`, { quantity }).then(cartFrom),
  removeItem: (id) => apiClient.delete(`/cart/items/${id}`).then(cartFrom),
  clear: () => apiClient.delete('/cart').then(cartFrom),
};
