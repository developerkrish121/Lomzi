import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { checkoutApi } from '@/features/checkout/api';
import {
  useAddressMutations,
  useAddresses,
  useOrder,
  useOrders,
  usePlaceOrder,
} from '@/features/checkout/hooks';
import { apiClient } from '@/lib/apiClient';

vi.mock('@/lib/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ currentUser: { id: 'user-1' } }) }));

const address = { id: 'address-1', fullName: 'Asha Rao', isDefault: true };
const order = {
  id: 'order-1',
  userId: 'user-1',
  status: 'PENDING',
  subtotal: '160.00',
  deliveryFee: '40.00',
  totalAmount: '200.00',
  items: [],
  address,
};

function setup(hook) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return { client, ...renderHook(hook, { wrapper }) };
}

describe('checkout API contract', () => {
  beforeEach(() => vi.clearAllMocks());

  test('maps address CRUD and order endpoints to response payloads', async () => {
    apiClient.get
      .mockResolvedValueOnce({ data: { addresses: [address] } })
      .mockResolvedValueOnce({ data: { orders: [order] } })
      .mockResolvedValueOnce({ data: { order } });
    apiClient.post
      .mockResolvedValueOnce({ data: { address } })
      .mockResolvedValueOnce({ data: { order } });
    apiClient.patch.mockResolvedValue({ data: { address } });
    apiClient.delete.mockResolvedValue({ data: { success: true } });

    expect(await checkoutApi.getAddresses()).toEqual([address]);
    expect(await checkoutApi.createAddress({ fullName: 'Asha Rao' })).toEqual(address);
    expect(await checkoutApi.updateAddress({ id: address.id, input: { city: 'Mysuru' } })).toEqual(
      address,
    );
    await checkoutApi.deleteAddress(address.id);
    const checkout = { addressId: address.id, idempotencyKey: 'checkout-key-123456' };
    expect(await checkoutApi.placeOrder(checkout)).toEqual(order);
    expect(await checkoutApi.getOrders()).toEqual([order]);
    expect(await checkoutApi.getOrder(order.id)).toEqual(order);

    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/orders', checkout);
    expect(apiClient.get).toHaveBeenLastCalledWith(`/orders/${order.id}`);
  });
});

describe('checkout query integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockImplementation((path) => {
      if (path === '/addresses') return Promise.resolve({ data: { addresses: [address] } });
      if (path === '/orders') return Promise.resolve({ data: { orders: [order] } });
      return Promise.resolve({ data: { order } });
    });
  });

  test('loads addresses, order history, and refresh-safe order details', async () => {
    const addresses = setup(() => useAddresses());
    await waitFor(() => expect(addresses.result.current.data).toEqual([address]));
    const orders = setup(() => useOrders());
    await waitFor(() => expect(orders.result.current.data).toEqual([order]));
    const detail = setup(() => useOrder(order.id));
    await waitFor(() => expect(detail.result.current.data).toEqual(order));
  });

  test('address mutations refresh the authenticated address cache', async () => {
    apiClient.post.mockResolvedValue({ data: { address } });
    const { result, client } = setup(() => useAddressMutations());
    client.setQueryData(['addresses', 'user-1'], []);
    await act(() => result.current.createAddress.mutateAsync({ fullName: 'Asha Rao' }));
    await waitFor(() =>
      expect(client.getQueryState(['addresses', 'user-1']).isInvalidated).toBe(true),
    );
  });

  test('placing an order clears cart immediately and seeds order details', async () => {
    apiClient.post.mockResolvedValue({ data: { order } });
    const { result, client } = setup(() => usePlaceOrder());
    client.setQueryData(['cart', 'user-1'], {
      items: [{ id: 'item-1' }],
      subtotal: 160,
      totalItems: 2,
    });
    const checkout = { addressId: address.id, idempotencyKey: 'checkout-key-123456' };
    await act(() => result.current.mutateAsync(checkout));
    expect(client.getQueryData(['cart', 'user-1'])).toEqual({
      items: [],
      subtotal: 0,
      totalItems: 0,
    });
    expect(client.getQueryData(['order', 'user-1', order.id])).toEqual(order);
    expect(apiClient.post).toHaveBeenCalledWith('/orders', checkout);
  });
});
