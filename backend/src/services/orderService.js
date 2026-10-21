import { orderRepository } from '@/repositories/orderRepository.js';
import { AppError } from '@/utils/AppError.js';

const DELIVERY_FEE = 40;

function money(value) {
  return Number(Number(value).toFixed(2));
}

function replay(existing, addressId) {
  if (existing.addressId !== addressId) {
    throw new AppError(
      'Idempotency key was already used with different checkout details',
      409,
      'IDEMPOTENCY_KEY_REUSED',
    );
  }
  return { order: existing, replayed: true };
}

export const orderService = {
  async place(userId, { addressId, idempotencyKey }) {
    try {
      return await orderRepository.transaction(async (tx) => {
        const existing = await orderRepository.findByIdempotencyKey(userId, idempotencyKey, tx);
        if (existing) return replay(existing, addressId);

        const address = await orderRepository.findAddress(addressId, userId, tx);
        if (!address) throw new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');
        const cart = await orderRepository.findCart(userId, tx);
        if (!cart?.items.length) throw new AppError('Cart is empty', 409, 'EMPTY_CART');

        for (const item of cart.items) {
          if (!item.product.isAvailable) {
            throw new AppError(`${item.product.name} is unavailable`, 409, 'PRODUCT_UNAVAILABLE');
          }
          if (item.product.stock < item.quantity) {
            throw new AppError(
              `Insufficient stock for ${item.product.name}`,
              409,
              'QUANTITY_EXCEEDS_STOCK',
            );
          }
        }

        const items = cart.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: money(item.product.discountPrice ?? item.product.price),
        }));
        const subtotal = money(items.reduce((sum, item) => sum + item.price * item.quantity, 0));
        const totalAmount = money(subtotal + DELIVERY_FEE);
        const order = await orderRepository.create(
          {
            userId,
            addressId,
            idempotencyKey,
            subtotal,
            deliveryFee: DELIVERY_FEE,
            totalAmount,
            items: { create: items },
          },
          tx,
        );
        for (const item of cart.items) {
          const result = await orderRepository.reserveStock(item.productId, item.quantity, tx);
          if (result.count !== 1) {
            throw new AppError(`Stock changed for ${item.product.name}`, 409, 'STOCK_CHANGED');
          }
        }
        await orderRepository.clearCart(cart.id, tx);
        return { order, replayed: false };
      });
    } catch (error) {
      if (error?.code !== 'P2002') throw error;
      const existing = await orderRepository.findByIdempotencyKey(userId, idempotencyKey);
      if (!existing) throw error;
      return replay(existing, addressId);
    }
  },
  list(userId) {
    return orderRepository.findAll(userId);
  },
  async get(userId, id) {
    const order = await orderRepository.findOwned(id, userId);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    return order;
  },
};
