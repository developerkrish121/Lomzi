import { adminDashboardRepository } from '@/repositories/adminDashboardRepository.js';

const statuses = ['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];

export const adminDashboardService = {
  async get() {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const data = await adminDashboardRepository.summary(startOfToday);
    const orderStatusCounts = Object.fromEntries(statuses.map((status) => [status, 0]));
    for (const row of data.statuses) orderStatusCounts[row.status] = row._count._all;
    const days = Array.from({ length: 7 }, (_, offset) => {
      const date = new Date(startOfToday);
      date.setDate(date.getDate() - (6 - offset));
      const key = date.toISOString().slice(0, 10);
      return {
        key,
        label: date.toLocaleDateString('en-IN', { weekday: 'short' }),
        orders: 0,
        revenue: 0,
      };
    });
    const trendByDay = new Map(days.map((day) => [day.key, day]));
    for (const order of data.trendOrders ?? []) {
      const createdDay = trendByDay.get(new Date(order.createdAt).toISOString().slice(0, 10));
      if (createdDay) createdDay.orders += 1;
      if (order.status === 'DELIVERED') {
        const deliveredDay = trendByDay.get(new Date(order.updatedAt).toISOString().slice(0, 10));
        if (deliveredDay) deliveredDay.revenue += Number(order.totalAmount);
      }
    }
    return {
      totals: {
        users: data.users,
        products: data.products,
        categories: data.categories,
        orders: data.orders,
      },
      orderStatusCounts,
      revenue: Number(data.revenue._sum.totalAmount ?? 0),
      todayRevenue: Number(data.todayRevenue._sum.totalAmount ?? 0),
      lowStockProducts: data.lowStock,
      outOfStockProducts: data.outOfStock,
      trends: days.map(({ key: _key, ...day }) => day),
      categoryDistribution: (data.categoryDistribution ?? []).map((category) => ({
        name: category.name,
        value: category._count.products,
      })),
      productAvailability: Object.fromEntries(
        (data.availability ?? []).map((row) => [
          row.isAvailable ? 'available' : 'unavailable',
          row._count._all,
        ]),
      ),
    };
  },
};
