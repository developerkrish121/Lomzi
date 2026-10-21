import { z } from 'zod';

const empty = z.object({}).optional();
const idParams = z.object({ id: z.uuid('Invalid id') });
const text = (label, max = 120) => z.string().trim().min(1, `${label} is required`).max(max);
const phone = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{7,18}$/, 'Invalid phone number');
const addressFields = {
  fullName: text('Full name', 100),
  phone,
  addressLine1: text('Address line 1', 180),
  addressLine2: z.string().trim().max(180).nullable().optional(),
  city: text('City', 80),
  state: text('State', 80),
  postalCode: z.string().trim().min(3).max(20),
  country: text('Country', 80),
  isDefault: z.boolean().optional(),
};

export const listAddressesSchema = z.object({ body: empty, params: empty, query: empty });
export const createAddressSchema = z.object({
  body: z.object(addressFields).strict(),
  params: empty,
  query: empty,
});
export const updateAddressSchema = z.object({
  body: z
    .object(addressFields)
    .partial()
    .strict()
    .refine((body) => Object.keys(body).length > 0, {
      message: 'At least one field is required',
    }),
  params: idParams,
  query: empty,
});
export const addressIdSchema = z.object({ body: empty, params: idParams, query: empty });
export const createOrderSchema = z.object({
  body: z
    .object({
      addressId: z.uuid('Invalid address id'),
      idempotencyKey: z
        .string()
        .trim()
        .min(16, 'Idempotency key must be at least 16 characters')
        .max(128, 'Idempotency key must be at most 128 characters')
        .regex(/^[A-Za-z0-9._:-]+$/, 'Invalid idempotency key'),
    })
    .strict(),
  params: empty,
  query: empty,
});
export const listOrdersSchema = z.object({ body: empty, params: empty, query: empty });
export const orderIdSchema = z.object({ body: empty, params: idParams, query: empty });
