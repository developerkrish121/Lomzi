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
const { addressRepository } = await import('@/repositories/addressRepository.js');
const { orderRepository } = await import('@/repositories/orderRepository.js');
const { userRepository } = await import('@/repositories/userRepository.js');

const userId = '123e4567-e89b-12d3-a456-426614174300';
const otherUserId = '123e4567-e89b-12d3-a456-426614174301';
const productId = '123e4567-e89b-12d3-a456-426614174302';
const cartId = '123e4567-e89b-12d3-a456-426614174303';
const tokenFor = (id) => jwt.sign({ sub: id, role: 'CUSTOMER' }, process.env.JWT_SECRET);
const authenticated = (call, id = userId) => call.set('Authorization', `Bearer ${tokenFor(id)}`);
const checkoutPayload = (addressId, idempotencyKey = randomUUID()) => ({
  addressId,
  idempotencyKey,
});
const addressInput = {
  fullName: 'Asha Rao',
  phone: '+91 9876543210',
  addressLine1: '42 Market Road',
  city: 'Bengaluru',
  state: 'Karnataka',
  postalCode: '560001',
  country: 'India',
  isDefault: true,
};

let addresses;
let orders;
let cartItems;
let stock;
let failAfterOrder;

beforeEach(() => {
  addresses = [];
  orders = [];
  cartItems = [];
  stock = 5;
  failAfterOrder = false;
  userRepository.findById = async (id) => ({
    id,
    name: 'Customer',
    email: `${id}@test.dev`,
    role: 'CUSTOMER',
    isActive: true,
  });

  addressRepository.findAll = async (id) => addresses.filter((address) => address.userId === id);
  addressRepository.findOwned = async (id, owner) =>
    addresses.find((address) => address.id === id && address.userId === owner) ?? null;
  addressRepository.transaction = async (work) => work({});
  addressRepository.unsetDefaults = async (owner) =>
    addresses
      .filter((address) => address.userId === owner)
      .forEach((address) => (address.isDefault = false));
  addressRepository.create = async (owner, data) => {
    const address = {
      id: randomUUID(),
      userId: owner,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    addresses.push(address);
    return address;
  };
  addressRepository.update = async (id, data) =>
    Object.assign(
      addresses.find((address) => address.id === id),
      data,
    );
  addressRepository.countOrders = async (id, owner) =>
    orders.filter((order) => order.addressId === id && order.userId === owner).length;
  addressRepository.delete = async (id) => {
    addresses = addresses.filter((address) => address.id !== id);
  };

  orderRepository.transaction = async (work) => {
    const snapshot = {
      stock,
      cartItems: structuredClone(cartItems),
      orders: structuredClone(orders),
    };
    try {
      return await work({});
    } catch (error) {
      stock = snapshot.stock;
      cartItems = snapshot.cartItems;
      orders = snapshot.orders;
      throw error;
    }
  };
  orderRepository.findAddress = async (id, owner) =>
    addresses.find((address) => address.id === id && address.userId === owner) ?? null;
  orderRepository.findCart = async (owner) => ({
    id: cartId,
    userId: owner,
    items: cartItems.map((item) => ({
      ...item,
      product: {
        id: productId,
        name: 'Apples',
        price: '100.00',
        discountPrice: '80.00',
        isAvailable: true,
        stock,
      },
    })),
  });
  orderRepository.findByIdempotencyKey = async (owner, idempotencyKey) =>
    orders.find((order) => order.userId === owner && order.idempotencyKey === idempotencyKey) ??
    null;
  orderRepository.reserveStock = async (_id, quantity) => {
    if (stock < quantity) return { count: 0 };
    stock -= quantity;
    return { count: 1 };
  };
  orderRepository.create = async (data) => {
    const order = {
      id: randomUUID(),
      status: 'PENDING',
      ...data,
      items: data.items.create,
      address: addresses.find((address) => address.id === data.addressId),
    };
    orders.push(order);
    return order;
  };
  orderRepository.clearCart = async () => {
    if (failAfterOrder) throw new Error('Simulated clear failure');
    cartItems = [];
  };
  orderRepository.findAll = async (owner) => orders.filter((order) => order.userId === owner);
  orderRepository.findOwned = async (id, owner) =>
    orders.find((order) => order.id === id && order.userId === owner) ?? null;
});

describe('checkout API', () => {
  test('creates, lists, updates, and deletes only owned addresses', async () => {
    const created = await authenticated(request(app).post('/api/v1/addresses'))
      .send(addressInput)
      .expect(201);
    const id = created.body.address.id;
    await authenticated(request(app).get('/api/v1/addresses'))
      .expect(200)
      .expect(({ body }) => assert.equal(body.addresses.length, 1));
    await authenticated(request(app).patch(`/api/v1/addresses/${id}`))
      .send({ city: 'Mysuru' })
      .expect(200)
      .expect(({ body }) => assert.equal(body.address.city, 'Mysuru'));
    await authenticated(request(app).patch(`/api/v1/addresses/${id}`), otherUserId)
      .send({ city: 'Delhi' })
      .expect(404);
    await authenticated(request(app).delete(`/api/v1/addresses/${id}`)).expect(200);
    assert.equal(addresses.length, 0);
  });

  test('places an order, snapshots prices, reduces stock, and clears the cart', async () => {
    const address = await addressRepository.create(userId, addressInput, {});
    cartItems = [{ id: randomUUID(), cartId, productId, quantity: 2 }];
    const response = await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id))
      .expect(201);
    assert.equal(response.body.order.subtotal, 160);
    assert.equal(response.body.order.deliveryFee, 40);
    assert.equal(response.body.order.totalAmount, 200);
    assert.equal(response.body.order.items[0].price, 80);
    assert.equal(stock, 3);
    assert.equal(cartItems.length, 0);

    await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id))
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'EMPTY_CART'));
    assert.equal(orders.length, 1);
    assert.equal(stock, 3);
  });

  test('rejects empty carts and insufficient stock before order creation', async () => {
    const address = await addressRepository.create(userId, addressInput, {});
    await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id))
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'EMPTY_CART'));
    cartItems = [{ id: randomUUID(), cartId, productId, quantity: 6 }];
    await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id))
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'QUANTITY_EXCEEDS_STOCK'));
    assert.equal(orders.length, 0);
    assert.equal(stock, 5);
  });

  test('rolls inventory and order creation back when cart clearing fails', async () => {
    const address = await addressRepository.create(userId, addressInput, {});
    cartItems = [{ id: randomUUID(), cartId, productId, quantity: 2 }];
    failAfterOrder = true;
    await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id))
      .expect(500);
    assert.equal(stock, 5);
    assert.equal(orders.length, 0);
    assert.equal(cartItems.length, 1);
  });

  test('reuses an order for the same checkout key and rejects changed checkout details', async () => {
    const address = await addressRepository.create(userId, addressInput, {});
    const otherAddress = await addressRepository.create(userId, {
      ...addressInput,
      addressLine1: '84 Other Road',
    });
    cartItems = [{ id: randomUUID(), cartId, productId, quantity: 2 }];
    const idempotencyKey = randomUUID();

    const created = await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id, idempotencyKey))
      .expect(201);
    const repeated = await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id, idempotencyKey))
      .expect(200);

    assert.equal(repeated.body.order.id, created.body.order.id);
    assert.equal(repeated.body.replayed, true);
    assert.equal(orders.length, 1);
    assert.equal(stock, 3);

    await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(otherAddress.id, idempotencyKey))
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'IDEMPOTENCY_KEY_REUSED'));
  });

  test('scopes checkout keys to the authenticated user', async () => {
    const firstAddress = await addressRepository.create(userId, addressInput, {});
    const secondAddress = await addressRepository.create(otherUserId, addressInput, {});
    const idempotencyKey = randomUUID();
    cartItems = [{ id: randomUUID(), cartId, productId, quantity: 1 }];
    const first = await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(firstAddress.id, idempotencyKey))
      .expect(201);

    cartItems = [{ id: randomUUID(), cartId, productId, quantity: 1 }];
    const second = await authenticated(request(app).post('/api/v1/orders'), otherUserId)
      .send(checkoutPayload(secondAddress.id, idempotencyKey))
      .expect(201);

    assert.notEqual(first.body.order.id, second.body.order.id);
    assert.equal(first.body.order.userId, userId);
    assert.equal(second.body.order.userId, otherUserId);
  });

  test('recovers the winning order after a concurrent unique-key conflict', async () => {
    const address = await addressRepository.create(userId, addressInput, {});
    const idempotencyKey = randomUUID();
    const winningOrder = {
      id: randomUUID(),
      userId,
      addressId: address.id,
      idempotencyKey,
      status: 'PENDING',
      items: [],
      address,
    };
    orderRepository.transaction = async () => {
      orders.push(winningOrder);
      throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
    };

    const response = await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload(address.id, idempotencyKey))
      .expect(200);

    assert.equal(response.body.order.id, winningOrder.id);
    assert.equal(response.body.replayed, true);
  });

  test('lists and reads only the authenticated user orders', async () => {
    orders.push(
      { id: randomUUID(), userId, status: 'PENDING' },
      { id: randomUUID(), userId: otherUserId, status: 'PENDING' },
    );
    await authenticated(request(app).get('/api/v1/orders'))
      .expect(200)
      .expect(({ body }) => assert.equal(body.orders.length, 1));
    await authenticated(request(app).get(`/api/v1/orders/${orders[0].id}`))
      .expect(200)
      .expect(({ body }) => assert.equal(body.order.id, orders[0].id));
    await authenticated(request(app).get(`/api/v1/orders/${orders[1].id}`)).expect(404);
  });

  test('requires authentication and validates checkout input', async () => {
    await request(app).get('/api/v1/addresses').expect(401);
    await request(app).post('/api/v1/orders').send(checkoutPayload(randomUUID())).expect(401);
    await authenticated(request(app).post('/api/v1/orders'))
      .send(checkoutPayload('invalid'))
      .expect(422);
    await authenticated(request(app).post('/api/v1/orders'))
      .send({ addressId: randomUUID() })
      .expect(422);
  });
});
