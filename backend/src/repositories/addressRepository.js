import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma.js';
import { withTransactionRetry } from '@/utils/transactionRetry.js';

export const addressRepository = {
  findAll(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  },
  findOwned(id, userId, db = prisma) {
    return db.address.findFirst({ where: { id, userId } });
  },
  transaction(work) {
    return withTransactionRetry(() =>
      prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }),
    );
  },
  unsetDefaults(userId, db) {
    return db.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  },
  create(userId, data, db) {
    return db.address.create({ data: { ...data, userId } });
  },
  update(id, data, db) {
    return db.address.update({ where: { id }, data });
  },
  countOrders(id, userId) {
    return prisma.order.count({ where: { addressId: id, userId } });
  },
  delete(id) {
    return prisma.address.delete({ where: { id } });
  },
};
