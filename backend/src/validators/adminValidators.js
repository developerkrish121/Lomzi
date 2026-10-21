import { z } from 'zod';

const empty = z.object({}).optional();
const idParams = z.object({ id: z.uuid('Invalid id') });
const slug = z
  .string()
  .trim()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug');
const nullableMoney = z.number().nonnegative().nullable().optional();
const productFields = {
  name: z.string().trim().min(2).max(140),
  slug: slug.optional(),
  description: z.string().trim().min(1).max(3000),
  price: z.number().positive().max(99999999.99),
  discountPrice: nullableMoney,
  stock: z.number().int().nonnegative().max(1000000),
  unit: z.string().trim().min(1).max(40),
  image: z.url().max(2000),
  isAvailable: z.boolean().optional(),
  categoryId: z.uuid('Invalid category id'),
};
const categoryFields = {
  name: z.string().trim().min(2).max(100),
  slug: slug.optional(),
  icon: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable().optional(),
};
const pageQuery = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).default(''),
});

const listProductQuery = pageQuery.extend({
  categoryId: z.uuid('Invalid category id').optional(),
  availability: z.enum(['available', 'unavailable']).optional(),
  stock: z.enum(['low', 'out']).optional(),
  includeDeleted: z.enum(['true', 'false']).default('false'),
  sort: z.enum(['newest', 'name', 'price-asc', 'price-desc', 'stock-asc']).default('newest'),
});
const listOrderQuery = pageQuery.extend({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'])
    .optional(),
});
const strictBody = (fields) => z.object(fields).strict();
const partialBody = (fields) =>
  z
    .object(fields)
    .partial()
    .strict()
    .refine((value) => Object.keys(value).length > 0, 'At least one field is required');

export const adminEmptySchema = z.object({ body: empty, params: empty, query: empty });
export const adminProductListSchema = z.object({
  body: empty,
  params: empty,
  query: listProductQuery,
});
export const adminProductIdSchema = z.object({ body: empty, params: idParams, query: empty });
export const createAdminProductSchema = z.object({
  body: strictBody(productFields),
  params: empty,
  query: empty,
});
export const updateAdminProductSchema = z.object({
  body: partialBody(productFields),
  params: idParams,
  query: empty,
});
export const updateAdminStockSchema = z.object({
  body: strictBody({ stock: z.number().int().nonnegative().max(1000000) }),
  params: idParams,
  query: empty,
});
export const adminCategoryListSchema = z.object({ body: empty, params: empty, query: pageQuery });
export const adminCategoryIdSchema = z.object({ body: empty, params: idParams, query: empty });
export const createAdminCategorySchema = z.object({
  body: strictBody(categoryFields),
  params: empty,
  query: empty,
});
export const updateAdminCategorySchema = z.object({
  body: partialBody(categoryFields),
  params: idParams,
  query: empty,
});
export const adminOrderListSchema = z.object({ body: empty, params: empty, query: listOrderQuery });
export const adminOrderIdSchema = z.object({ body: empty, params: idParams, query: empty });
export const updateAdminOrderStatusSchema = z.object({
  body: strictBody({
    status: z.enum(['CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  }),
  params: idParams,
  query: empty,
});
