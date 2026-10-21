import { prisma } from '@/config/prisma.js';

const includeCount = { _count: { select: { products: true } } };

export const adminCategoryRepository = {
  async findPage(filters) {
    const where = filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: 'insensitive' } },
            { slug: { contains: filters.q, mode: 'insensitive' } },
          ],
        }
      : {};
    const [items, total] = await prisma.$transaction([
      prisma.category.findMany({
        where,
        include: includeCount,
        orderBy: { name: 'asc' },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.category.count({ where }),
    ]);
    return { items, total };
  },
  findById(id) {
    return prisma.category.findUnique({ where: { id }, include: includeCount });
  },
  create(data) {
    return prisma.category.create({ data, include: includeCount });
  },
  update(id, data) {
    return prisma.category.update({ where: { id }, data, include: includeCount });
  },
  delete(id) {
    return prisma.category.delete({ where: { id } });
  },
};
