import { Router } from 'express';
import { addressController } from '@/controllers/addressController.js';
import { asyncHandler } from '@/middleware/asyncHandler.js';
import { authenticate } from '@/middleware/authenticate.js';
import { validate } from '@/middleware/validate.js';
import {
  addressIdSchema,
  createAddressSchema,
  listAddressesSchema,
  updateAddressSchema,
} from '@/validators/checkoutValidators.js';

export const addressRouter = Router();
addressRouter.use(authenticate);
addressRouter.get('/', validate(listAddressesSchema), asyncHandler(addressController.list));
addressRouter.post('/', validate(createAddressSchema), asyncHandler(addressController.create));
addressRouter.patch('/:id', validate(updateAddressSchema), asyncHandler(addressController.update));
addressRouter.delete('/:id', validate(addressIdSchema), asyncHandler(addressController.remove));
