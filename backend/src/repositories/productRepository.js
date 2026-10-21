import { prisma } from '@/config/prisma.js';

const categorySelect = { id: true, name: true, slug: true, icon: true };

function buildWhere(filters) {
  const where = { deletedAt: null };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.available !== undefined) where.isAvailable = filters.available === 'true';
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined && { gte: filters.minPrice }),
      ...(filters.maxPrice !== undefined && { lte: filters.maxPrice }),
    };
  }
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
      { category: { name: { contains: filters.q, mode: 'insensitive' } } },
    ];
  }
  return where;
}

const orderBy = {
  featured: [{ isAvailable: 'desc' }, { discountPrice: 'asc' }, { createdAt: 'desc' }],
  'price-asc': { price: 'asc' },
  'price-desc': { price: 'desc' },
  name: { name: 'asc' },
  newest: { createdAt: 'desc' },
};

export const productRepository = {
  async findPage(filters) {
    const where = buildWhere(filters);
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy: orderBy[filters.sort],
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: { category: { select: categorySelect } },
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },

  findById(id) {
    return prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: { category: { select: categorySelect } },
    });
  },

  findRelated(product) {
    return prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        isAvailable: true,
        deletedAt: null,
      },
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { category: { select: categorySelect } },
    });
  },
};
