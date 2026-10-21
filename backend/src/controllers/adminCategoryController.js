import { adminCategoryService } from '@/services/adminCategoryService.js';

export const adminCategoryController = {
  async list(req, res) {
    return res
      .status(200)
      .json({ success: true, ...(await adminCategoryService.list(req.validated.query)) });
  },
  async get(req, res) {
    return res
      .status(200)
      .json({ success: true, category: await adminCategoryService.get(req.validated.params.id) });
  },
  async create(req, res) {
    return res
      .status(201)
      .json({ success: true, category: await adminCategoryService.create(req.validated.body) });
  },
  async update(req, res) {
    return res.status(200).json({
      success: true,
      category: await adminCategoryService.update(req.validated.params.id, req.validated.body),
    });
  },
  async remove(req, res) {
    await adminCategoryService.remove(req.validated.params.id);
    return res.status(200).json({ success: true, message: 'Category deleted' });
  },
};
