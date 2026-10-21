import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { beforeEach, describe, test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import jwt from 'jsonwebtoken';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { app } = await import('@/app.js');
const { cartRepository } = await import('@/repositories/cartRepository.js');
const { userRepository } = await import('@/repositories/userRepository.js');

const userId = '123e4567-e89b-12d3-a456-426614174100';
const otherUserId = '123e4567-e89b-12d3-a456-426614174101';
const productId = '123e4567-e89b-12d3-a456-426614174200';
const unavailableId = '123e4567-e89b-12d3-a456-426614174201';
const outOfStockId = '123e4567-e89b-12d3-a456-426614174202';
const products = new Map([
  [
    productId,
    {
      id: productId,
      name: 'Apples',
      price: '189.00',
      discountPrice: '159.00',
      stock: 5,
      isAvailable: true,
    },
  ],
  [
    unavailableId,
    {
      id: unavailableId,
      name: 'Mangoes',
      price: '300.00',
      discountPrice: null,
      stock: 5,
      isAvailable: false,
    },
  ],
  [
    outOfStockId,
    {
      id: outOfStockId,
      name: 'Milk',
      price: '72.00',
      discountPrice: null,
      stock: 0,
      isAvailable: true,
    },
  ],
]);

const tokenFor = (id) =>
  jwt.sign({ sub: id, role: 'CUSTOMER' }, process.env.JWT_SECRET, { expiresIn: '1h' });
const authenticated = (call, id = userId) => call.set('Authorization', `Bearer ${tokenFor(id)}`);
let cart;
let items;
let transactionQueue;

beforeEach(() => {
  cart = null;
  items = [];
  transactionQueue = Promise.resolve();
  userRepository.findById = async (id) => ({
    id,
    name: 'Test User',
    email: `${id}@example.com`,
    role: 'CUSTOMER',
    isActive: true,
  });
  cartRepository.findByUserId = async (id) =>
    cart?.userId === id
      ? {
          ...cart,
          items: items
            .filter((item) => item.cartId === cart.id)
            .map((item) => ({ ...item, product: products.get(item.productId) })),
        }
      : null;
  cartRepository.ensureForUser = async (id) => {
    cart ??= { id: randomUUID(), userId: id };
    return cart;
  };
  cartRepository.transaction = async (work) => {
    const run = transactionQueue.then(async () => {
      const snapshot = structuredClone(items);
      try {
        return await work({});
      } catch (error) {
        items = snapshot;
        throw error;
      }
    });
    transactionQueue = run.catch(() => {});
    return run;
  };
  cartRepository.findProduct = async (id) => products.get(id) ?? null;
  cartRepository.findItemByProduct = async (cartId, id) =>
    items.find((item) => item.cartId === cartId && item.productId === id) ?? null;
  cartRepository.findItemForUser = async (itemId, id) => {
    const item = items.find((entry) => entry.id === itemId);
    return item && cart?.userId === id ? { ...item, product: products.get(item.productId) } : null;
  };
  cartRepository.createItem = async (cartId, id, quantity) => {
    const item = { id: randomUUID(), cartId, productId: id, quantity, createdAt: new Date() };
    items.push(item);
    return item;
  };
  cartRepository.incrementItem = async (cartId, id, quantity) => {
    let item = items.find((entry) => entry.cartId === cartId && entry.productId === id);
    if (item) item.quantity += quantity;
    else {
      item = { id: randomUUID(), cartId, productId: id, quantity, createdAt: new Date() };
      items.push(item);
    }
    return item;
  };
  cartRepository.updateItemQuantity = async (id, quantity) => {
    const item = items.find((entry) => entry.id === id);
    item.quantity = quantity;
    return item;
  };
  cartRepository.deleteItem = async (id) => {
    items = items.filter((entry) => entry.id !== id);
  };
  cartRepository.clear = async (cartId) => {
    items = items.filter((item) => item.cartId !== cartId);
  };
});

describe('shopping cart API', () => {
  test('requires authentication and creates an empty cart for its owner', async () => {
    await request(app).get('/api/v1/cart').expect(401);
    const response = await authenticated(request(app).get('/api/v1/cart')).expect(200);
    assert.deepEqual(response.body.items, []);
    assert.equal(response.body.subtotal, 0);
    assert.equal(response.body.totalItems, 0);
  });

  test('adds products and merges duplicate product quantities', async () => {
    let response = await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId, quantity: 2 })
      .expect(201);
    assert.equal(response.body.items.length, 1);
    assert.equal(response.body.totalItems, 2);
    assert.equal(response.body.subtotal, 318);

    response = await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId, quantity: 1 })
      .expect(201);
    assert.equal(response.body.items.length, 1);
    assert.equal(response.body.items[0].quantity, 3);
    assert.equal(response.body.totalItems, 3);
  });

  test('preserves every quantity increment across concurrent additions', async () => {
    const additions = await Promise.all([
      authenticated(request(app).post('/api/v1/cart/items')).send({ productId, quantity: 2 }),
      authenticated(request(app).post('/api/v1/cart/items')).send({ productId, quantity: 2 }),
    ]);

    assert.deepEqual(
      additions.map((response) => response.status),
      [201, 201],
    );
    assert.equal(items.length, 1);
    assert.equal(items[0].quantity, 4);
  });

  test('rolls back a concurrent addition when the combined quantity exceeds stock', async () => {
    const additions = await Promise.all([
      authenticated(request(app).post('/api/v1/cart/items')).send({ productId, quantity: 3 }),
      authenticated(request(app).post('/api/v1/cart/items')).send({ productId, quantity: 3 }),
    ]);

    assert.deepEqual(additions.map((response) => response.status).sort(), [201, 409]);
    assert.equal(
      additions.find((response) => response.status === 409).body.error.code,
      'QUANTITY_EXCEEDS_STOCK',
    );
    assert.equal(items.length, 1);
    assert.equal(items[0].quantity, 3);
  });

  test('decreases quantity and removes an item automatically at zero', async () => {
    const added = await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId, quantity: 3 })
      .expect(201);
    const itemId = added.body.items[0].id;
    let response = await authenticated(request(app).patch(`/api/v1/cart/items/${itemId}`))
      .send({ quantity: 1 })
      .expect(200);
    assert.equal(response.body.items[0].quantity, 1);
    response = await authenticated(request(app).patch(`/api/v1/cart/items/${itemId}`))
      .send({ quantity: 0 })
      .expect(200);
    assert.equal(response.body.items.length, 0);
    assert.equal(response.body.totalItems, 0);
  });

  test('enforces availability, stock and meaningful product errors', async () => {
    await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId: randomUUID(), quantity: 1 })
      .expect(404)
      .expect(({ body }) => assert.equal(body.error.code, 'PRODUCT_NOT_FOUND'));
    await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId: unavailableId, quantity: 1 })
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'PRODUCT_UNAVAILABLE'));
    await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId: outOfStockId, quantity: 1 })
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'OUT_OF_STOCK'));
    await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId, quantity: 6 })
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'QUANTITY_EXCEEDS_STOCK'));
  });

  test('removes items, clears the cart, and prevents cross-user access', async () => {
    const first = await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId, quantity: 1 })
      .expect(201);
    const itemId = first.body.items[0].id;
    await authenticated(request(app).delete(`/api/v1/cart/items/${itemId}`), otherUserId).expect(
      404,
    );
    let response = await authenticated(request(app).delete(`/api/v1/cart/items/${itemId}`)).expect(
      200,
    );
    assert.equal(response.body.items.length, 0);
    await authenticated(request(app).post('/api/v1/cart/items'))
      .send({ productId, quantity: 2 })
      .expect(201);
    response = await authenticated(request(app).delete('/api/v1/cart')).expect(200);
    assert.deepEqual(response.body, { success: true, items: [], subtotal: 0, totalItems: 0 });
  });
});
