import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/features/admin/api';

export const adminKeys = {
  all: ['admin'],
  dashboard: ['admin', 'dashboard'],
  products: (params) => ['admin', 'products', params],
  product: (id) => ['admin', 'product', id],
  categories: (params) => ['admin', 'categories', params],
  orders: (params) => ['admin', 'orders', params],
  order: (id) => ['admin', 'order', id],
};

export const useAdminDashboard = () =>
  useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: adminApi.dashboard,
    refetchInterval: 30_000,
  });
export const useAdminProducts = (params) =>
  useQuery({ queryKey: adminKeys.products(params), queryFn: () => adminApi.products(params) });
export const useAdminProduct = (id) =>
  useQuery({
    queryKey: adminKeys.product(id),
    queryFn: () => adminApi.product(id),
    enabled: Boolean(id),
  });
export const useAdminCategories = (params = { page: 1, limit: 100, q: '' }) =>
  useQuery({ queryKey: adminKeys.categories(params), queryFn: () => adminApi.categories(params) });
export const useAdminOrders = (params) =>
  useQuery({
    queryKey: adminKeys.orders(params),
    queryFn: () => adminApi.orders(params),
    refetchInterval: 30_000,
  });
export const useAdminOrder = (id) =>
  useQuery({
    queryKey: adminKeys.order(id),
    queryFn: () => adminApi.order(id),
    enabled: Boolean(id),
  });

export function useAdminMutations() {
  const client = useQueryClient();
  const refreshProducts = () => {
    client.invalidateQueries({ queryKey: ['admin', 'products'] });
    client.invalidateQueries({ queryKey: adminKeys.dashboard });
    client.invalidateQueries({ queryKey: ['products'] });
    client.invalidateQueries({ queryKey: ['product'] });
    client.invalidateQueries({ queryKey: ['categories'] });
  };
  const refreshCategories = () => {
    client.invalidateQueries({ queryKey: ['admin', 'categories'] });
    client.invalidateQueries({ queryKey: adminKeys.dashboard });
    client.invalidateQueries({ queryKey: ['categories'] });
    client.invalidateQueries({ queryKey: ['products'] });
  };
  return {
    createProduct: useMutation({ mutationFn: adminApi.createProduct, onSuccess: refreshProducts }),
    updateProduct: useMutation({ mutationFn: adminApi.updateProduct, onSuccess: refreshProducts }),
    deleteProduct: useMutation({ mutationFn: adminApi.deleteProduct, onSuccess: refreshProducts }),
    updateStock: useMutation({ mutationFn: adminApi.updateStock, onSuccess: refreshProducts }),
    toggleProduct: useMutation({ mutationFn: adminApi.toggleProduct, onSuccess: refreshProducts }),
    createCategory: useMutation({
      mutationFn: adminApi.createCategory,
      onSuccess: refreshCategories,
    }),
    updateCategory: useMutation({
      mutationFn: adminApi.updateCategory,
      onSuccess: refreshCategories,
    }),
    deleteCategory: useMutation({
      mutationFn: adminApi.deleteCategory,
      onSuccess: refreshCategories,
    }),
  };
}

export function useOrderStatusMutation(id) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: adminApi.updateOrderStatus,
    onSuccess: (order) => {
      client.setQueryData(adminKeys.order(id), order);
      client.invalidateQueries({ queryKey: ['admin', 'orders'] });
      client.invalidateQueries({ queryKey: adminKeys.dashboard });
      client.invalidateQueries({ queryKey: ['orders'] });
      client.invalidateQueries({ queryKey: ['order'] });
    },
  });
}
