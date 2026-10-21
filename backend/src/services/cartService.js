import { cartRepository } from '@/repositories/cartRepository.js';
import { AppError } from '@/utils/AppError.js';

function ensurePurchasable(product, quantity) {
  if (!product) throw new AppError('Product not found', 404, 'PRODUCT_NOT_FOUND');
  if (!product.isAvailable)
    throw new AppError('Product is unavailable', 409, 'PRODUCT_UNAVAILABLE');
  if (product.stock <= 0) throw new AppError('Product is out of stock', 409, 'OUT_OF_STOCK');
  if (quantity > product.stock) {
    throw new AppError(
      `Only ${product.stock} unit${product.stock === 1 ? '' : 's'} available`,
      409,
      'QUANTITY_EXCEEDS_STOCK',
    );
  }
}

function presentCart(cart) {
  const items = cart.items.map((item) => {
    const unitPrice = Number(item.product.discountPrice ?? item.product.price);
    return { ...item, unitPrice, lineTotal: Number((unitPrice * item.quantity).toFixed(2)) };
  });
  return {
    items,
    subtotal: Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2)),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}

async function loadOrCreateCart(userId) {
  let cart = await cartRepository.findByUserId(userId);
  if (!cart) {
    await cartRepository.ensureForUser(userId);
    cart = await cartRepository.findByUserId(userId);
  }
  if (!cart) throw new AppError('Cart could not be created', 500, 'CART_NOT_FOUND');
  return cart;
}

export const cartService = {
  async get(userId) {
    return presentCart(await loadOrCreateCart(userId));
  },

  async addItem(userId, input) {
    const cart = await loadOrCreateCart(userId);
    await cartRepository.transaction(async (tx) => {
      const product = await cartRepository.findProduct(input.productId, tx);
      ensurePurchasable(product, input.quantity);
      const item = await cartRepository.incrementItem(cart.id, input.productId, input.quantity, tx);
      ensurePurchasable(product, item.quantity);
    });
    return this.get(userId);
  },

  async updateItem(userId, itemId, quantity) {
    const item = await cartRepository.findItemForUser(itemId, userId);
    if (!item) throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    if (quantity === 0) await cartRepository.deleteItem(item.id);
    else {
      ensurePurchasable(item.product, quantity);
      await cartRepository.updateItemQuantity(item.id, quantity);
    }
    return this.get(userId);
  },

  async removeItem(userId, itemId) {
    const item = await cartRepository.findItemForUser(itemId, userId);
    if (!item) throw new AppError('Cart item not found', 404, 'CART_ITEM_NOT_FOUND');
    await cartRepository.deleteItem(item.id);
    return this.get(userId);
  },

  async clear(userId) {
    const cart = await loadOrCreateCart(userId);
    await cartRepository.clear(cart.id);
    return this.get(userId);
  },
};
