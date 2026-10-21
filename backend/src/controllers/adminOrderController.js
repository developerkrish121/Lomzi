import { adminOrderService } from '@/services/adminOrderService.js';

export const adminOrderController = {
  async list(req, res) {
    return res
      .status(200)
      .json({ success: true, ...(await adminOrderService.list(req.validated.query)) });
  },
  async get(req, res) {
    return res
      .status(200)
      .json({ success: true, order: await adminOrderService.get(req.validated.params.id) });
  },
  async status(req, res) {
    return res.status(200).json({
      success: true,
      order: await adminOrderService.updateStatus(
        req.validated.params.id,
        req.validated.body.status,
      ),
    });
  },
};
