import { categoryRepository } from '@/repositories/categoryRepository.js';
import { productRepository } from '@/repositories/productRepository.js';
import { AppError } from '@/utils/AppError.js';

export const productService = {
  async list(filters) {
    const result = await productRepository.findPage(filters);
    return {
      products: result.items,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / filters.limit),
      },
    };
  },

  async byCategory(slug, filters) {
    const category = await categoryRepository.findBySlug(slug);
    if (!category) throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
    return { category, ...(await this.list({ ...filters, category: slug })) };
  },

  async details(id) {
    const product = await productRepository.findById(id);
    if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
    return { product, relatedProducts: await productRepository.findRelated(product) };
  },
};
