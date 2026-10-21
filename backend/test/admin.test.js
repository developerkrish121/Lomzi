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
const { adminCategoryRepository } = await import('@/repositories/adminCategoryRepository.js');
const { adminDashboardRepository } = await import('@/repositories/adminDashboardRepository.js');
const { adminOrderRepository } = await import('@/repositories/adminOrderRepository.js');
const { adminProductRepository } = await import('@/repositories/adminProductRepository.js');
const { userRepository } = await import('@/repositories/userRepository.js');
const { productRepository } = await import('@/repositories/productRepository.js');
const { cartRepository } = await import('@/repositories/cartRepository.js');
const { orderRepository: customerOrderRepository } =
  await import('@/repositories/orderRepository.js');

const adminId = randomUUID();
const customerId = randomUUID();
const categoryId = randomUUID();
const tokenFor = (id, role) => jwt.sign({ sub: id, role }, process.env.JWT_SECRET);
const asAdmin = (call) => call.set('Authorization', `Bearer ${tokenFor(adminId, 'ADMIN')}`);
const asCustomer = (call) =>
  call.set('Authorization', `Bearer ${tokenFor(customerId, 'CUSTOMER')}`);

let products;
let categories;
let orders;
let restoredStock;

beforeEach(() => {
  products = [];
  categories = [
    { id: categoryId, name: 'Fruit', slug: 'fruit', icon: 'apple', _count: { products: 0 } },
  ];
  orders = [];
  restoredStock = 0;
  userRepository.findById = async (id) => ({
    id,
    name: id === adminId ? 'Admin' : 'Customer',
    email: `${id}@example.test`,
    role: id === adminId ? 'ADMIN' : 'CUSTOMER',
    isActive: true,
  });

  adminCategoryRepository.findById = async (id) =>
    categories.find((item) => item.id === id) ?? null;
  adminCategoryRepository.findPage = async () => ({ items: categories, total: categories.length });
  adminCategoryRepository.create = async (data) => {
    const category = { id: randomUUID(), ...data, _count: { products: 0 } };
    categories.push(category);
    return category;
  };
  adminCategoryRepository.update = async (id, data) =>
    Object.assign(
      categories.find((item) => item.id === id),
      data,
    );
  adminCategoryRepository.delete = async (id) => {
    categories = categories.filter((item) => item.id !== id);
  };

  adminProductRepository.findPage = async () => ({ items: products, total: products.length });
  adminProductRepository.findById = async (id) =>
    products.find((item) => item.id === id && !item.deletedAt) ?? null;
  adminProductRepository.create = async (data) => {
    const product = {
      id: randomUUID(),
      ...data,
      isAvailable: data.isAvailable ?? true,
      deletedAt: null,
      category: categories[0],
    };
    products.push(product);
    categories[0]._count.products += 1;
    return product;
  };
  adminProductRepository.update = async (id, data) =>
    Object.assign(
      products.find((item) => item.id === id),
      data,
    );
  adminProductRepository.softDelete = async (id) =>
    Object.assign(
      products.find((item) => item.id === id),
      { deletedAt: new Date(), isAvailable: false },
    );
  productRepository.findPage = async () => ({
    items: products.filter((item) => !item.deletedAt),
    total: products.filter((item) => !item.deletedAt).length,
  });
  productRepository.findById = async (id) =>
    products.find((item) => item.id === id && !item.deletedAt) ?? null;
  productRepository.findRelated = async () => [];
  cartRepository.findByUserId = async (userId) => ({ id: randomUUID(), userId, items: [] });
  cartRepository.transaction = async (work) => work({});
  cartRepository.findProduct = async (id) => products.find((item) => item.id === id) ?? null;
  cartRepository.findItemByProduct = async () => null;
  cartRepository.incrementItem = async () => assert.fail('unavailable products must not be added');

  adminOrderRepository.findPage = async () => ({ items: orders, total: orders.length });
  adminOrderRepository.findById = async (id) => orders.find((item) => item.id === id) ?? null;
  adminOrderRepository.transaction = async (work) => work({});
  adminOrderRepository.restoreStock = async (items) => {
    restoredStock += items.reduce((sum, item) => sum + item.quantity, 0);
  };
  adminOrderRepository.updateStatus = async (id, status) =>
    Object.assign(
      orders.find((item) => item.id === id),
      { status },
    );
  customerOrderRepository.findOwned = async (id, owner) =>
    orders.find((item) => item.id === id && item.userId === owner) ?? null;

  adminDashboardRepository.summary = async () => ({
    users: 9,
    products: 7,
    categories: 3,
    orders: 5,
    statuses: [{ status: 'DELIVERED', _count: { _all: 2 } }],
    revenue: { _sum: { totalAmount: '725.50' } },
    todayRevenue: { _sum: { totalAmount: '200.00' } },
    lowStock: 2,
    outOfStock: 1,
    trendOrders: [],
    categoryDistribution: [{ name: 'Fruit', _count: { products: 7 } }],
    availability: [
      { isAvailable: true, _count: { _all: 6 } },
      { isAvailable: false, _count: { _all: 1 } },
    ],
  });
});

describe('admin API', () => {
  test('requires authentication and rejects customer accounts', async () => {
    await request(app).get('/api/v1/admin/dashboard').expect(401);
    await asCustomer(request(app).get('/api/v1/admin/dashboard'))
      .expect(403)
      .expect(({ body }) => assert.equal(body.error.code, 'FORBIDDEN'));
  });

  test('creates, updates, stocks, toggles and soft-deletes products', async () => {
    const payload = {
      name: 'Royal Gala Apple',
      description: 'Crisp apples',
      price: 150,
      discountPrice: 130,
      stock: 12,
      unit: '1 kg',
      image: 'https://example.test/apple.jpg',
      categoryId,
    };
    const created = await asAdmin(request(app).post('/api/v1/admin/products'))
      .send(payload)
      .expect(201);
    const id = created.body.product.id;
    assert.equal(created.body.product.slug, 'royal-gala-apple');
    await asAdmin(request(app).patch(`/api/v1/admin/products/${id}`))
      .send({ price: 145 })
      .expect(200);
    await asAdmin(request(app).patch(`/api/v1/admin/products/${id}/stock`))
      .send({ stock: 0 })
      .expect(200);
    await asAdmin(request(app).patch(`/api/v1/admin/products/${id}/toggle`)).expect(409);
    await asAdmin(request(app).delete(`/api/v1/admin/products/${id}`)).expect(200);
    assert.ok(products[0].deletedAt);
  });

  test('validates product input and manages empty categories', async () => {
    await asAdmin(request(app).post('/api/v1/admin/products'))
      .send({ name: 'Incomplete' })
      .expect(422);
    const created = await asAdmin(request(app).post('/api/v1/admin/categories'))
      .send({ name: 'Bakery', icon: 'wheat', description: null })
      .expect(201);
    await asAdmin(request(app).patch(`/api/v1/admin/categories/${created.body.category.id}`))
      .send({ name: 'Fresh Bakery' })
      .expect(200);
    await asAdmin(
      request(app).delete(`/api/v1/admin/categories/${created.body.category.id}`),
    ).expect(200);
    categories[0]._count.products = 1;
    await asAdmin(request(app).delete(`/api/v1/admin/categories/${categoryId}`))
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'CATEGORY_NOT_EMPTY'));
  });

  test('enforces order transitions and restores stock exactly once on cancellation', async () => {
    const order = {
      id: randomUUID(),
      status: 'PENDING',
      items: [{ productId: randomUUID(), quantity: 3 }],
    };
    orders.push(order);
    await asAdmin(request(app).patch(`/api/v1/admin/orders/${order.id}/status`))
      .send({ status: 'PACKING' })
      .expect(409);
    await asAdmin(request(app).patch(`/api/v1/admin/orders/${order.id}/status`))
      .send({ status: 'CONFIRMED' })
      .expect(200);
    await asAdmin(request(app).patch(`/api/v1/admin/orders/${order.id}/status`))
      .send({ status: 'CANCELLED' })
      .expect(200);
    assert.equal(restoredStock, 3);
    await asAdmin(request(app).patch(`/api/v1/admin/orders/${order.id}/status`))
      .send({ status: 'CANCELLED' })
      .expect(409);
    assert.equal(restoredStock, 3);
  });

  test('returns complete dashboard metrics with delivered revenue', async () => {
    await asAdmin(request(app).get('/api/v1/admin/dashboard'))
      .expect(200)
      .expect(({ body }) => {
        assert.deepEqual(body.dashboard.totals, {
          users: 9,
          products: 7,
          categories: 3,
          orders: 5,
        });
        assert.equal(body.dashboard.orderStatusCounts.DELIVERED, 2);
        assert.equal(body.dashboard.orderStatusCounts.PENDING, 0);
        assert.equal(body.dashboard.revenue, 725.5);
        assert.equal(body.dashboard.todayRevenue, 200);
        assert.equal(body.dashboard.lowStockProducts, 2);
        assert.equal(body.dashboard.outOfStockProducts, 1);
      });
  });

  test('propagates admin catalogue and order changes to customer APIs', async () => {
    const created = await asAdmin(request(app).post('/api/v1/admin/products'))
      .send({
        name: 'Integration Apple',
        description: 'Visible to customers',
        price: 120,
        discountPrice: 100,
        stock: 8,
        unit: '1 kg',
        image: 'https://example.test/integration-apple.jpg',
        categoryId,
      })
      .expect(201);
    const id = created.body.product.id;
    await request(app)
      .get('/api/v1/products')
      .expect(200)
      .expect(({ body }) =>
        assert.equal(
          body.products.some((item) => item.id === id),
          true,
        ),
      );

    await asAdmin(request(app).patch(`/api/v1/admin/products/${id}`))
      .send({ name: 'Updated Integration Apple', stock: 3 })
      .expect(200);
    await request(app)
      .get(`/api/v1/products/${id}`)
      .expect(200)
      .expect(({ body }) => {
        assert.equal(body.product.name, 'Updated Integration Apple');
        assert.equal(body.product.stock, 3);
      });

    await asAdmin(request(app).patch(`/api/v1/admin/products/${id}/toggle`)).expect(200);
    await asCustomer(request(app).post('/api/v1/cart/items'))
      .send({ productId: id, quantity: 1 })
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'PRODUCT_UNAVAILABLE'));

    const order = { id: randomUUID(), userId: customerId, status: 'PENDING', items: [] };
    orders.push(order);
    await asAdmin(request(app).patch(`/api/v1/admin/orders/${order.id}/status`))
      .send({ status: 'CONFIRMED' })
      .expect(200);
    await asCustomer(request(app).get(`/api/v1/orders/${order.id}`))
      .expect(200)
      .expect(({ body }) => assert.equal(body.order.status, 'CONFIRMED'));
  });
});
