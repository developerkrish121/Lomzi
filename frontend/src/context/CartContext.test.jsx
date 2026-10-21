import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { CartProvider } from '@/context/CartContext';
import { cartApi } from '@/features/cart/api';
import { useCart } from '@/hooks/useCart';

const state = vi.hoisted(() => ({ user: { id: 'user-1' } }));
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ currentUser: state.user, loading: false }),
}));
vi.mock('@/features/cart/api', () => ({
  cartApi: {
    get: vi.fn(),
    addItem: vi.fn(),
    updateItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
}));

const product = { id: 'product-1', name: 'Apples', stock: 5 };
const item = { id: 'item-1', product, quantity: 2, unitPrice: 50, lineTotal: 100 };
const populated = { items: [item], subtotal: 100, totalItems: 2 };
const empty = { items: [], subtotal: 0, totalItems: 0 };

function setup() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }) => (
    <QueryClientProvider client={client}>
      <CartProvider>{children}</CartProvider>
    </QueryClientProvider>
  );
  return { client, ...renderHook(() => useCart(), { wrapper }) };
}

describe('CartProvider integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.user = { id: 'user-1' };
    cartApi.get.mockResolvedValue(populated);
  });

  test('loads the authenticated cart once and restores it through the query cache', async () => {
    const { result, unmount } = setup();
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.cart).toEqual(populated);
    expect(cartApi.get).toHaveBeenCalledTimes(1);
    unmount();
  });

  test('optimistically recalculates quantities and accepts the authoritative response', async () => {
    let resolveRequest;
    cartApi.updateItem.mockReturnValue(new Promise((resolve) => (resolveRequest = resolve)));
    const { result } = setup();
    await waitFor(() => expect(result.current.cart.totalItems).toBe(2));

    let request;
    act(() => {
      request = result.current.updateItem(item.id, 3);
    });
    await waitFor(() => {
      expect(result.current.cart.totalItems).toBe(3);
      expect(result.current.cart.subtotal).toBe(150);
    });
    await act(async () =>
      resolveRequest({
        ...populated,
        items: [{ ...item, quantity: 3, lineTotal: 150 }],
        subtotal: 150,
        totalItems: 3,
      }),
    );
    await request;
    expect(cartApi.updateItem.mock.calls[0][0]).toEqual({ id: item.id, quantity: 3 });
  });

  test('rolls an optimistic removal back when the server rejects it', async () => {
    cartApi.removeItem.mockRejectedValue(new Error('offline'));
    const { result } = setup();
    await waitFor(() => expect(result.current.cart.totalItems).toBe(2));
    let failure;
    await act(async () => {
      try {
        await result.current.removeItem(item.id);
      } catch (error) {
        failure = error;
      }
    });
    expect(failure).toEqual(new Error('offline'));
    await waitFor(() => expect(result.current.cart).toEqual(populated));
  });

  test('keeps caches isolated by authenticated user id', async () => {
    const { client, result, rerender } = setup();
    await waitFor(() => expect(result.current.cart.totalItems).toBe(2));
    state.user = { id: 'user-2' };
    cartApi.get.mockResolvedValueOnce(empty);
    rerender();
    await waitFor(() => expect(result.current.cart.totalItems).toBe(0));
    expect(client.getQueryData(['cart', 'user-1'])).toEqual(populated);
    expect(client.getQueryData(['cart', 'user-2'])).toEqual(empty);
  });
});
