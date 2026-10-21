import { prisma } from '@/config/prisma.js';

const includeCategory = { category: { select: { id: true, name: true, slug: true, icon: true } } };
const productOrder = {
  newest: { createdAt: 'desc' },
  name: { name: 'asc' },
  'price-asc': { price: 'asc' },
  'price-desc': { price: 'desc' },
  'stock-asc': { stock: 'asc' },
};

function whereFor(filters) {
  const where = {};
  if (filters.includeDeleted !== 'true') where.deletedAt = null;
  if (filters.categoryId) where.categoryId = filters.categoryId;
  if (filters.availability) where.isAvailable = filters.availability === 'available';
  if (filters.stock === 'out') where.stock = 0;
  if (filters.stock === 'low') where.stock = { gt: 0, lte: 10 };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: 'insensitive' } },
      { description: { contains: filters.q, mode: 'insensitive' } },
      { slug: { contains: filters.q, mode: 'insensitive' } },
    ];
  }
  return where;
}

export const adminProductRepository = {
  async findPage(filters) {
    const where = whereFor(filters);
    const [items, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        include: includeCategory,
        orderBy: productOrder[filters.sort] ?? productOrder.newest,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ]);
    return { items, total };
  },
  findById(id) {
    return prisma.product.findFirst({ where: { id, deletedAt: null }, include: includeCategory });
  },
  create(data) {
    return prisma.product.create({ data, include: includeCategory });
  },
  update(id, data) {
    return prisma.product.update({ where: { id }, data, include: includeCategory });
  },
  softDelete(id) {
    return prisma.product.update({
      where: { id },
      data: { deletedAt: new Date(), isAvailable: false },
      include: includeCategory,
    });
  },
};
