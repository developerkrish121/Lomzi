import { prisma } from '@/config/prisma.js';

export const adminDashboardRepository = {
  async summary(startOfToday) {
    const trendStart = new Date(startOfToday);
    trendStart.setDate(trendStart.getDate() - 6);
    const [
      users,
      products,
      categories,
      orders,
      statuses,
      revenue,
      todayRevenue,
      lowStock,
      outOfStock,
      trendOrders,
      categoryDistribution,
      availability,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { deletedAt: null } }),
      prisma.category.count(),
      prisma.order.count(),
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
      prisma.order.aggregate({ where: { status: 'DELIVERED' }, _sum: { totalAmount: true } }),
      prisma.order.aggregate({
        where: { status: 'DELIVERED', updatedAt: { gte: startOfToday } },
        _sum: { totalAmount: true },
      }),
      prisma.product.count({ where: { deletedAt: null, stock: { gt: 0, lte: 10 } } }),
      prisma.product.count({ where: { deletedAt: null, stock: 0 } }),
      prisma.order.findMany({
        where: { OR: [{ createdAt: { gte: trendStart } }, { updatedAt: { gte: trendStart } }] },
        select: { createdAt: true, updatedAt: true, status: true, totalAmount: true },
      }),
      prisma.category.findMany({
        select: {
          name: true,
          _count: { select: { products: { where: { deletedAt: null } } } },
        },
        orderBy: { name: 'asc' },
      }),
      prisma.product.groupBy({
        by: ['isAvailable'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
    ]);
    return {
      users,
      products,
      categories,
      orders,
      statuses,
      revenue,
      todayRevenue,
      lowStock,
      outOfStock,
      trendOrders,
      categoryDistribution,
      availability,
    };
  },
};
