import { prisma } from '@/config/prisma.js';

export const categoryRepository = {
  findAll() {
    return prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: { where: { deletedAt: null } } } },
      },
    });
  },

  findBySlug(slug) {
    return prisma.category.findUnique({ where: { slug } });
  },
};
