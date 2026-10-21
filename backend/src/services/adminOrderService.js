import { adminOrderRepository } from '@/repositories/adminOrderRepository.js';
import { AppError } from '@/utils/AppError.js';

const transitions = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PACKING', 'CANCELLED'],
  PACKING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: [],
};
const pagination = (filters, total) => ({
  page: filters.page,
  limit: filters.limit,
  total,
  totalPages: Math.ceil(total / filters.limit),
});

export const adminOrderService = {
  async list(filters) {
    const result = await adminOrderRepository.findPage(filters);
    return { orders: result.items, pagination: pagination(filters, result.total) };
  },
  async get(id) {
    const order = await adminOrderRepository.findById(id);
    if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
    return order;
  },
  updateStatus(id, nextStatus) {
    return adminOrderRepository.transaction(async (tx) => {
      const order = await adminOrderRepository.findById(id, tx);
      if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
      if (!transitions[order.status].includes(nextStatus)) {
        throw new AppError(
          `Order cannot move from ${order.status} to ${nextStatus}`,
          409,
          'INVALID_ORDER_STATUS_TRANSITION',
        );
      }
      if (nextStatus === 'CANCELLED') await adminOrderRepository.restoreStock(order.items, tx);
      return adminOrderRepository.updateStatus(id, nextStatus, tx);
    });
  },
};
