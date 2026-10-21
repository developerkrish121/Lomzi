import { Prisma } from '@prisma/client';
import { prisma } from '@/config/prisma.js';
import { withTransactionRetry } from '@/utils/transactionRetry.js';

const includeOrder = {
  user: { select: { id: true, name: true, email: true, phone: true } },
  address: true,
  items: { include: { product: { select: { id: true, name: true, unit: true, image: true } } } },
};

export const adminOrderRepository = {
  async findPage(filters) {
    const where = {};
    if (filters.status) where.status = filters.status;
    if (filters.q) {
      where.OR = [
        { id: { equals: /^[0-9a-f-]{36}$/i.test(filters.q) ? filters.q : undefined } },
        { user: { name: { contains: filters.q, mode: 'insensitive' } } },
        { user: { email: { contains: filters.q, mode: 'insensitive' } } },
      ].filter((clause) => clause.id?.equals !== undefined || clause.user);
    }
    const [items, total] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        include: includeOrder,
        orderBy: { createdAt: 'desc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.order.count({ where }),
    ]);
    return { items, total };
  },
  findById(id, db = prisma) {
    return db.order.findUnique({ where: { id }, include: includeOrder });
  },
  updateStatus(id, status, db) {
    return db.order.update({ where: { id }, data: { status }, include: includeOrder });
  },
  restoreStock(items, db) {
    return Promise.all(
      items.map((item) =>
        db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        }),
      ),
    );
  },
  transaction(work) {
    return withTransactionRetry(() =>
      prisma.$transaction(work, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }),
    );
  },
};
