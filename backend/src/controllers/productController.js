import { productService } from '@/services/productService.js';

export const productController = {
  async list(req, res) {
    const result = await productService.list(req.validated.query);
    res.status(200).json({ success: true, ...result });
  },

  async search(req, res) {
    const result = await productService.list(req.validated.query);
    res.status(200).json({ success: true, query: req.validated.query.q, ...result });
  },

  async byCategory(req, res) {
    const result = await productService.byCategory(req.validated.params.slug, req.validated.query);
    res.status(200).json({ success: true, ...result });
  },

  async details(req, res) {
    const result = await productService.details(req.validated.params.id);
    res.status(200).json({ success: true, ...result });
  },
};
