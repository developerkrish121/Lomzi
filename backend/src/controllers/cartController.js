import { cartService } from '@/services/cartService.js';

const sendCart = (res, cart) => res.status(200).json({ success: true, ...cart });

export const cartController = {
  async get(req, res) {
    return sendCart(res, await cartService.get(req.user.id));
  },

  async addItem(req, res) {
    const cart = await cartService.addItem(req.user.id, req.validated.body);
    return res.status(201).json({ success: true, ...cart });
  },

  async updateItem(req, res) {
    return sendCart(
      res,
      await cartService.updateItem(
        req.user.id,
        req.validated.params.id,
        req.validated.body.quantity,
      ),
    );
  },

  async removeItem(req, res) {
    return sendCart(res, await cartService.removeItem(req.user.id, req.validated.params.id));
  },

  async clear(req, res) {
    return sendCart(res, await cartService.clear(req.user.id));
  },
};
