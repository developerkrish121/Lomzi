import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma.js';
import { withTransactionRetry } from '@/utils/transactionRetry.js';

const includeOrder = {
  address: true,
  items: { include: { product: { select: { id: true, name: true, unit: true, image: true } } } },
};

export const orderRepository = {
  transaction(work) {
    return withTransactionRetry(() =>
      prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }),
    );
  },
  findAddress(id, userId, db) {
    return db.address.findFirst({ where: { id, userId } });
  },
  findCart(userId, db) {
    return db.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true }, orderBy: { createdAt: 'asc' } } },
    });
  },
  findByIdempotencyKey(userId, idempotencyKey, db = prisma) {
    return db.order.findUnique({
      where: { userId_idempotencyKey: { userId, idempotencyKey } },
      include: includeOrder,
    });
  },
  reserveStock(productId, quantity, db) {
    return db.product.updateMany({
      where: { id: productId, isAvailable: true, deletedAt: null, stock: { gte: quantity } },
      data: { stock: { decrement: quantity } },
    });
  },
  create(data, db) {
    return db.order.create({ data, include: includeOrder });
  },
  clearCart(cartId, db) {
    return db.cartItem.deleteMany({ where: { cartId } });
  },
  findAll(userId) {
    return prisma.order.findMany({
      where: { userId },
      include: includeOrder,
      orderBy: { createdAt: 'desc' },
    });
  },
  findOwned(id, userId) {
    return prisma.order.findFirst({ where: { id, userId }, include: includeOrder });
  },
};
