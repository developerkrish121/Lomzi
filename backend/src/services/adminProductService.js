import { Prisma } from '@prisma/client';
import { adminCategoryRepository } from '@/repositories/adminCategoryRepository.js';
import { adminProductRepository } from '@/repositories/adminProductRepository.js';
import { AppError } from '@/utils/AppError.js';
import { slugify } from '@/utils/slugify.js';

const notFound = () => new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
const pagination = (filters, total) => ({
  page: filters.page,
  limit: filters.limit,
  total,
  totalPages: Math.ceil(total / filters.limit),
});

function validatePricing(data, current = {}) {
  const price = data.price ?? Number(current.price);
  const discount = data.discountPrice === undefined ? current.discountPrice : data.discountPrice;
  if (discount !== null && discount !== undefined && Number(discount) >= Number(price)) {
    throw new AppError('Discount price must be lower than price', 422, 'INVALID_DISCOUNT_PRICE');
  }
}

async function ensureCategory(categoryId) {
  if (!(await adminCategoryRepository.findById(categoryId))) {
    throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
  }
}

async function write(operation) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      throw new AppError('A product with this slug already exists', 409, 'PRODUCT_SLUG_IN_USE');
    }
    throw error;
  }
}

export const adminProductService = {
  async list(filters) {
    const result = await adminProductRepository.findPage(filters);
    return { products: result.items, pagination: pagination(filters, result.total) };
  },
  async get(id) {
    const product = await adminProductRepository.findById(id);
    if (!product) throw notFound();
    return product;
  },
  async create(data) {
    await ensureCategory(data.categoryId);
    validatePricing(data);
    const productData = { ...data, slug: data.slug ?? slugify(data.name) };
    if (!productData.slug)
      throw new AppError('Product name cannot form a valid slug', 422, 'INVALID_SLUG');
    if (productData.stock === 0) productData.isAvailable = false;
    return write(() => adminProductRepository.create(productData));
  },
  async update(id, data) {
    const product = await this.get(id);
    if (data.categoryId) await ensureCategory(data.categoryId);
    validatePricing(data, product);
    const productData = { ...data };
    if (data.name && data.slug === undefined) productData.slug = slugify(data.name);
    if (data.stock === 0) productData.isAvailable = false;
    if (data.isAvailable === true && (data.stock ?? product.stock) === 0) {
      throw new AppError(
        'An out-of-stock product cannot be available',
        409,
        'PRODUCT_OUT_OF_STOCK',
      );
    }
    return write(() => adminProductRepository.update(id, productData));
  },
  async remove(id) {
    await this.get(id);
    return adminProductRepository.softDelete(id);
  },
  async updateStock(id, stock) {
    await this.get(id);
    return adminProductRepository.update(id, { stock, ...(stock === 0 && { isAvailable: false }) });
  },
  async toggle(id) {
    const product = await this.get(id);
    if (!product.isAvailable && product.stock === 0) {
      throw new AppError(
        'An out-of-stock product cannot be available',
        409,
        'PRODUCT_OUT_OF_STOCK',
      );
    }
    return adminProductRepository.update(id, { isAvailable: !product.isAvailable });
  },
};
