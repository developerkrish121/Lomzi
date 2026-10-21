import { addressRepository } from '@/repositories/addressRepository.js';
import { AppError } from '@/utils/AppError.js';

const notFound = () => new AppError('Address not found', 404, 'ADDRESS_NOT_FOUND');

export const addressService = {
  list(userId) {
    return addressRepository.findAll(userId);
  },
  create(userId, input) {
    return addressRepository.transaction(async (tx) => {
      if (input.isDefault) await addressRepository.unsetDefaults(userId, tx);
      return addressRepository.create(userId, input, tx);
    });
  },
  async update(userId, id, input) {
    if (!(await addressRepository.findOwned(id, userId))) throw notFound();
    return addressRepository.transaction(async (tx) => {
      if (input.isDefault) await addressRepository.unsetDefaults(userId, tx);
      return addressRepository.update(id, input, tx);
    });
  },
  async remove(userId, id) {
    if (!(await addressRepository.findOwned(id, userId))) throw notFound();
    if ((await addressRepository.countOrders(id, userId)) > 0) {
      throw new AppError(
        'Address is used by an order and cannot be deleted',
        409,
        'ADDRESS_IN_USE',
      );
    }
    await addressRepository.delete(id);
  },
};
