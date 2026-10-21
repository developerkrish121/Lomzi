import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CartContext } from '@/context/cartContextValue';
import { cartApi } from '@/features/cart/api';
import { useAuth } from '@/hooks/useAuth';

const emptyCart = { items: [], subtotal: 0, totalItems: 0 };
const errorMessage = (error) =>
  error.response?.data?.error?.message || 'Your cart could not be updated. Please try again.';

function totals(items) {
  return {
    items,
    subtotal: Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

export function CartProvider({ children }) {
  const { currentUser, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const cartKey = useMemo(() => ['cart', currentUser?.id ?? 'guest'], [currentUser?.id]);
  const query = useQuery({
    queryKey: cartKey,
    queryFn: cartApi.get,
    enabled: !authLoading && Boolean(currentUser),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!currentUser && !authLoading) {
      setDrawerOpen(false);
    }
  }, [authLoading, currentUser]);

  const serverMutationOptions = (mutationFn) => ({
    mutationFn,
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
  const optimisticMutationOptions = (mutationFn, update) => ({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: cartKey });
      const previous = queryClient.getQueryData(cartKey);
      queryClient.setQueryData(cartKey, (cart = emptyCart) => update(cart, variables));
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(cartKey, context.previous);
    },
    onSuccess: (cart) => queryClient.setQueryData(cartKey, cart),
  });
  const addMutation = useMutation(serverMutationOptions(cartApi.addItem));
  const updateMutation = useMutation(
    optimisticMutationOptions(cartApi.updateItem, (cart, { id, quantity }) =>
      totals(
        cart.items
          .filter((item) => item.id !== id || quantity > 0)
          .map((item) =>
            item.id === id
              ? { ...item, quantity, lineTotal: Number((item.unitPrice * quantity).toFixed(2)) }
              : item,
          ),
      ),
    ),
  );
  const removeMutation = useMutation(
    optimisticMutationOptions(cartApi.removeItem, (cart, id) =>
      totals(cart.items.filter((item) => item.id !== id)),
    ),
  );
  const clearMutation = useMutation(optimisticMutationOptions(cartApi.clear, () => emptyCart));

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      cart: query.data ?? emptyCart,
      loading: authLoading || (Boolean(currentUser) && query.isPending),
      error: query.error,
      refetch: query.refetch,
      drawerOpen,
      openDrawer,
      closeDrawer,
      addItem: (productId, quantity = 1) => addMutation.mutateAsync({ productId, quantity }),
      updateItem: (id, quantity) => updateMutation.mutateAsync({ id, quantity }),
      removeItem: (id) => removeMutation.mutateAsync(id),
      clearCart: () => clearMutation.mutateAsync(),
      errorMessage,
      addingProductId: addMutation.isPending ? addMutation.variables?.productId : null,
      pendingItemId:
        (updateMutation.isPending && updateMutation.variables?.id) ||
        (removeMutation.isPending && removeMutation.variables) ||
        null,
      clearing: clearMutation.isPending,
    }),
    [
      addMutation,
      authLoading,
      clearMutation,
      currentUser,
      closeDrawer,
      drawerOpen,
      openDrawer,
      query.data,
      query.error,
      query.isPending,
      query.refetch,
      removeMutation,
      updateMutation,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
