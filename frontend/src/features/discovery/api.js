import { apiClient } from '@/lib/apiClient';

export async function getCategories() {
  const { data } = await apiClient.get('/categories');
  return data.categories;
}

export async function getProducts(params = {}) {
  const { data } = await apiClient.get('/products', { params });
  return data;
}

export async function getProduct(id) {
  const { data } = await apiClient.get(`/products/${id}`);
  return data;
}
