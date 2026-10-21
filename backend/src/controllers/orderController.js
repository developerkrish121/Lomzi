import { orderService } from '@/services/orderService.js';

export const orderController = {
  async create(req, res) {
    const result = await orderService.place(req.user.id, req.validated.body);
    return res
      .status(result.replayed ? 200 : 201)
      .json({ success: true, order: result.order, replayed: result.replayed });
  },
  async list(req, res) {
    const orders = await orderService.list(req.user.id);
    return res.status(200).json({ success: true, orders });
  },
  async get(req, res) {
    const order = await orderService.get(req.user.id, req.validated.params.id);
    return res.status(200).json({ success: true, order });
  },
};
