import { adminProductService } from '@/services/adminProductService.js';

export const adminProductController = {
  async list(req, res) {
    return res
      .status(200)
      .json({ success: true, ...(await adminProductService.list(req.validated.query)) });
  },
  async get(req, res) {
    return res
      .status(200)
      .json({ success: true, product: await adminProductService.get(req.validated.params.id) });
  },
  async create(req, res) {
    return res
      .status(201)
      .json({ success: true, product: await adminProductService.create(req.validated.body) });
  },
  async update(req, res) {
    return res.status(200).json({
      success: true,
      product: await adminProductService.update(req.validated.params.id, req.validated.body),
    });
  },
  async remove(req, res) {
    return res
      .status(200)
      .json({ success: true, product: await adminProductService.remove(req.validated.params.id) });
  },
  async stock(req, res) {
    return res.status(200).json({
      success: true,
      product: await adminProductService.updateStock(
        req.validated.params.id,
        req.validated.body.stock,
      ),
    });
  },
  async toggle(req, res) {
    return res
      .status(200)
      .json({ success: true, product: await adminProductService.toggle(req.validated.params.id) });
  },
};
