import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { adminApi } from '@/features/admin/api';
import { useAdminMutations, useOrderStatusMutation } from '@/features/admin/hooks';
import { categorySchema, productSchema } from '@/features/admin/schemas';
import { apiClient } from '@/lib/apiClient';

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const product = { id: 'product-1', name: 'Apple', stock: 10, isAvailable: true };
const category = { id: 'category-1', name: 'Fruit' };
const order = { id: 'order-1', status: 'CONFIRMED' };

function setup(hook) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(hook, { wrapper }) };
}

describe('admin API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  test('maps dashboard, catalogue and order operations to protected backend endpoints', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { dashboard: { revenue: 500 } } })
      .mockResolvedValueOnce({ data: { products: [product], pagination: {} } })
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { categories: [category], pagination: {} } })
      .mockResolvedValueOnce({ data: { orders: [order], pagination: {} } })
      .mockResolvedValueOnce({ data: { order } });
    apiClient.post
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { category } });
    apiClient.patch
      .mockResolvedValueOnce({ data: { product } })
      .mockResolvedValueOnce({ data: { product: { ...product, stock: 4 } } })
      .mockResolvedValueOnce({ data: { product: { ...product, isAvailable: false } } })
      .mockResolvedValueOnce({ data: { category } })
      .mockResolvedValueOnce({ data: { order } });
    apiClient.delete.mockResolvedValue({ data: { success: true, product } });

    expect(await adminApi.dashboard()).toEqual({ revenue: 500 });
    await adminApi.products({ page: 1 });
    await adminApi.product(product.id);
    await adminApi.createProduct({ name: 'Apple' });
    await adminApi.updateProduct({ id: product.id, body: { stock: 8 } });
    await adminApi.updateStock({ id: product.id, stock: 4 });
    await adminApi.toggleProduct(product.id);
    await adminApi.deleteProduct(product.id);
    await adminApi.categories({ page: 1 });
    await adminApi.createCategory({ name: 'Fruit' });
    await adminApi.updateCategory({ id: category.id, body: { name: 'Fresh Fruit' } });
    await adminApi.deleteCategory(category.id);
    await adminApi.orders({ status: 'PENDING' });
    await adminApi.order(order.id);
    await adminApi.updateOrderStatus({ id: order.id, status: 'CONFIRMED' });

    expect(apiClient.patch).toHaveBeenCalledWith('/admin/products/product-1/stock', { stock: 4 });
    expect(apiClient.patch).toHaveBeenCalledWith('/admin/orders/order-1/status', {
      status: 'CONFIRMED',
    });
  });

  test('validates product and category forms before requests are sent', () => {
    expect(
      productSchema.safeParse({
        name: 'Apple',
        description: 'Crisp',
        categoryId: crypto.randomUUID(),
        price: 100,
        discountPrice: 80,
        stock: 4,
        unit: '1 kg',
        image: 'https://example.com/apple.jpg',
        isAvailable: true,
      }).success,
    ).toBe(true);
    expect(productSchema.safeParse({ name: 'A', price: 0 }).success).toBe(false);
    expect(categorySchema.safeParse({ name: 'Fruit', icon: '🍎', description: '' }).success).toBe(
      true,
    );
  });

  test('admin mutations invalidate both admin and customer-facing caches', async () => {
    apiClient.patch.mockResolvedValue({ data: { product, order } });
    const products = setup(() => useAdminMutations());
    for (const key of [
      ['admin', 'products'],
      ['admin', 'dashboard'],
      ['products'],
      ['product'],
      ['categories'],
    ]) {
      products.client.setQueryData(key, {});
    }
    await act(() => products.result.current.toggleProduct.mutateAsync(product.id));
    await waitFor(() =>
      expect(products.client.getQueryState(['products']).isInvalidated).toBe(true),
    );
    expect(products.client.getQueryState(['product']).isInvalidated).toBe(true);
    expect(products.client.getQueryState(['categories']).isInvalidated).toBe(true);

    const orders = setup(() => useOrderStatusMutation(order.id));
    orders.client.setQueryData(['orders'], [order]);
    orders.client.setQueryData(['order'], order);
    await act(() => orders.result.current.mutateAsync({ id: order.id, status: 'CONFIRMED' }));
    await waitFor(() => expect(orders.client.getQueryState(['orders']).isInvalidated).toBe(true));
    expect(orders.client.getQueryState(['order']).isInvalidated).toBe(true);
  });
});
