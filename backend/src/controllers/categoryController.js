import { categoryService } from '@/services/categoryService.js';

export const categoryController = {
  async list(_req, res) {
    const categories = await categoryService.list();
    res.status(200).json({ success: true, categories });
  },
};
