import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma.js';
import { withTransactionRetry } from '@/utils/transactionRetry.js';

const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' },
    include: {
      product: {
        include: { category: { select: { id: true, name: true, slug: true } } },
      },
    },
  },
};

export const cartRepository = {
  transaction(work) {
    return withTransactionRetry(() =>
      prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }),
    );
  },

  findByUserId(userId) {
    return prisma.cart.findUnique({ where: { userId }, include: cartInclude });
  },

  ensureForUser(userId) {
    return prisma.cart.upsert({ where: { userId }, update: {}, create: { userId } });
  },

  findProduct(productId, db = prisma) {
    return db.product.findUnique({ where: { id: productId } });
  },

  findItemByProduct(cartId, productId) {
    return prisma.cartItem.findUnique({ where: { cartId_productId: { cartId, productId } } });
  },

  findItemForUser(itemId, userId) {
    return prisma.cartItem.findFirst({
      where: { id: itemId, cart: { userId } },
      include: { product: true },
    });
  },

  createItem(cartId, productId, quantity) {
    return prisma.cartItem.create({ data: { cartId, productId, quantity } });
  },

  incrementItem(cartId, productId, quantity, db = prisma) {
    return db.cartItem.upsert({
      where: { cartId_productId: { cartId, productId } },
      update: { quantity: { increment: quantity } },
      create: { cartId, productId, quantity },
    });
  },

  updateItemQuantity(itemId, quantity) {
    return prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
  },

  deleteItem(itemId) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  },

  clear(cartId) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  },
};
