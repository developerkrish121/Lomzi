import { Prisma } from '@prisma/client';
import { adminCategoryRepository } from '@/repositories/adminCategoryRepository.js';
import { AppError } from '@/utils/AppError.js';
import { slugify } from '@/utils/slugify.js';

const notFound = () => new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
const pagination = (filters, total) => ({
  page: filters.page,
  limit: filters.limit,
  total,
  totalPages: Math.ceil(total / filters.limit),
});

async function write(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError(
        'A category with this name or slug already exists',
        409,
        'CATEGORY_IN_USE',
      );
    }
    throw error;
  }
}

export const adminCategoryService = {
  async list(filters) {
    const result = await adminCategoryRepository.findPage(filters);
    return { categories: result.items, pagination: pagination(filters, result.total) };
  },
  async get(id) {
    const category = await adminCategoryRepository.findById(id);
    if (!category) throw notFound();
    return category;
  },
  async create(data) {
    const categoryData = { ...data, slug: data.slug ?? slugify(data.name) };
    if (!categoryData.slug)
      throw new AppError('Category name cannot form a valid slug', 422, 'INVALID_SLUG');
    return write(() => adminCategoryRepository.create(categoryData));
  },
  async update(id, data) {
    await this.get(id);
    const categoryData = { ...data };
    if (data.name && data.slug === undefined) categoryData.slug = slugify(data.name);
    return write(() => adminCategoryRepository.update(id, categoryData));
  },
  async remove(id) {
    const category = await this.get(id);
    if (category._count.products > 0) {
      throw new AppError(
        'Category cannot be deleted while it contains products',
        409,
        'CATEGORY_NOT_EMPTY',
      );
    }
    await adminCategoryRepository.delete(id);
  },
};
