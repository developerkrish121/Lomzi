import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { getCategories, getProduct, getProducts } from '@/features/discovery/api';

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: getCategories, staleTime: 10 * 60 * 1000 });
}

export function useProducts(params = {}, options = {}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    ...options,
  });
}

export function useProduct(id) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => getProduct(id),
    enabled: Boolean(id),
    staleTime: 5 * 60 * 1000,
  });
}
