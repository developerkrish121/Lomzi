import { addressService } from '@/services/addressService.js';

export const addressController = {
  async list(req, res) {
    const addresses = await addressService.list(req.user.id);
    return res.status(200).json({ success: true, addresses });
  },
  async create(req, res) {
    const address = await addressService.create(req.user.id, req.validated.body);
    return res.status(201).json({ success: true, address });
  },
  async update(req, res) {
    const address = await addressService.update(
      req.user.id,
      req.validated.params.id,
      req.validated.body,
    );
    return res.status(200).json({ success: true, address });
  },
  async remove(req, res) {
    await addressService.remove(req.user.id, req.validated.params.id);
    return res.status(200).json({ success: true, message: 'Address deleted' });
  },
};
