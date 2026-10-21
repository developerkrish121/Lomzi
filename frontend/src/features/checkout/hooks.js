import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { checkoutApi } from '@/features/checkout/api';
import { useAuth } from '@/hooks/useAuth';

export const checkoutError = (error) =>
  error.response?.data?.error?.message || 'Unable to complete the request. Please try again.';

export function useAddresses() {
  const { currentUser } = useAuth();
  return useQuery({
    queryKey: ['addresses', currentUser.id],
    queryFn: checkoutApi.getAddresses,
    staleTime: 60_000,
  });
}

export function useAddressMutations() {
  const { currentUser } = useAuth();
  const client = useQueryClient();
  const key = ['addresses', currentUser.id];
  const settle = () => client.invalidateQueries({ queryKey: key });
  return {
    createAddress: useMutation({ mutationFn: checkoutApi.createAddress, onSuccess: settle }),
    updateAddress: useMutation({ mutationFn: checkoutApi.updateAddress, onSuccess: settle }),
    deleteAddress: useMutation({ mutationFn: checkoutApi.deleteAddress, onSuccess: settle }),
  };
}

export function usePlaceOrder() {
  const { currentUser } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: checkoutApi.placeOrder,
    onSuccess: (order) => {
      client.setQueryData(['cart', currentUser.id], { items: [], subtotal: 0, totalItems: 0 });
      client.setQueryData(['order', currentUser.id, order.id], order);
      client.invalidateQueries({ queryKey: ['orders', currentUser.id] });
    },
  });
}

export function useOrders() {
  const { currentUser } = useAuth();
  return useQuery({
    queryKey: ['orders', currentUser.id],
    queryFn: checkoutApi.getOrders,
    staleTime: 30_000,
  });
}

export function useOrder(id) {
  const { currentUser } = useAuth();
  return useQuery({
    queryKey: ['order', currentUser.id, id],
    queryFn: () => checkoutApi.getOrder(id),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
