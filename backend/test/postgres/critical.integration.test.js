import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { after, before, test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import { Prisma, PrismaClient } from '@prisma/client';
import { validateTestDatabaseUrl } from './safety.js';

if (process.env.POSTGRES_INTEGRATION_TESTS !== '1') {
  throw new Error(
    'PostgreSQL integration tests must be started through the guarded test:postgres runner',
  );
}

validateTestDatabaseUrl(process.env.DATABASE_URL);

register('../../src/alias-loader.js', pathToFileURL('./test/postgres/'));

const { addressService } = await import('@/services/addressService.js');
const { cartRepository } = await import('@/repositories/cartRepository.js');
const { orderRepository } = await import('@/repositories/orderRepository.js');
const { orderService } = await import('@/services/orderService.js');
const { withTransactionRetry } = await import('@/utils/transactionRetry.js');

const setup = new PrismaClient();
const connectionA = new PrismaClient();
const connectionB = new PrismaClient();
const createdUserIds = new Set();
const createdCategoryIds = new Set();

const addressData = (suffix) => ({
  fullName: `Integration User ${suffix}`,
  phone: '+919876543210',
  addressLine1: `${suffix} Test Street`,
  city: 'Test City',
  state: 'Test State',
  postalCode: '123456',
  country: 'India',
  isDefault: true,
});

async function fixture(stock = 5) {
  const marker = randomUUID();
  const category = await setup.category.create({
    data: { name: `Integration ${marker}`, slug: `integration-${marker}`, icon: 'TestTube' },
  });
  createdCategoryIds.add(category.id);
  const product = await setup.product.create({
    data: {
      name: `Integration Product ${marker}`,
      slug: `integration-product-${marker}`,
      description: 'Database concurrency integration fixture',
      price: 100,
      stock,
      unit: '1 unit',
      image: 'https://example.test/product.jpg',
      categoryId: category.id,
    },
  });
  const users = [];
  for (const number of [1, 2]) {
    const user = await setup.user.create({
      data: {
        name: `Integration User ${number}`,
        email: `integration-${marker}-${number}@example.test`,
        password: 'not-used-by-integration-tests',
      },
    });
    createdUserIds.add(user.id);
    users.push(user);
  }
  const carts = await Promise.all(
    users.map((user) => setup.cart.create({ data: { userId: user.id } })),
  );
  const addresses = await Promise.all(
    users.map((user, index) =>
      setup.address.create({ data: { ...addressData(index + 1), userId: user.id } }),
    ),
  );
  return { category, product, users, carts, addresses };
}

async function addInConnection(database, cartId, productId, quantity) {
  return withTransactionRetry(() =>
    database.$transaction(
      async (tx) => {
        const product = await cartRepository.findProduct(productId, tx);
        const item = await cartRepository.incrementItem(cartId, productId, quantity, tx);
        if (!product?.isAvailable || item.quantity > product.stock) {
          throw Object.assign(new Error('Quantity exceeds stock'), {
            code: 'QUANTITY_EXCEEDS_STOCK',
          });
        }
        return item;
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    ),
  );
}

before(async () => {
  await Promise.all([setup.$connect(), connectionA.$connect(), connectionB.$connect()]);
});

after(async () => {
  try {
    const userIds = [...createdUserIds];
    const categoryIds = [...createdCategoryIds];
    if (userIds.length) {
      await setup.orderItem.deleteMany({ where: { order: { userId: { in: userIds } } } });
      await setup.order.deleteMany({ where: { userId: { in: userIds } } });
      await setup.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } });
      await setup.cart.deleteMany({ where: { userId: { in: userIds } } });
      await setup.address.deleteMany({ where: { userId: { in: userIds } } });
      await setup.user.deleteMany({ where: { id: { in: userIds } } });
    }
    if (categoryIds.length) {
      await setup.product.deleteMany({ where: { categoryId: { in: categoryIds } } });
      await setup.category.deleteMany({ where: { id: { in: categoryIds } } });
    }
  } finally {
    await Promise.all([setup.$disconnect(), connectionA.$disconnect(), connectionB.$disconnect()]);
  }
});

test('concurrent cart additions on separate connections preserve every increment', async () => {
  const { carts, product } = await fixture(5);
  await Promise.all([
    addInConnection(connectionA, carts[0].id, product.id, 2),
    addInConnection(connectionB, carts[0].id, product.id, 2),
  ]);

  const item = await setup.cartItem.findUnique({
    where: { cartId_productId: { cartId: carts[0].id, productId: product.id } },
  });
  assert.equal(item.quantity, 4);
});

test('concurrent cart additions roll back the increment that exceeds stock', async () => {
  const { carts, product } = await fixture(5);
  const results = await Promise.allSettled([
    addInConnection(connectionA, carts[0].id, product.id, 3),
    addInConnection(connectionB, carts[0].id, product.id, 3),
  ]);

  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(results.filter((result) => result.status === 'rejected').length, 1);
  const item = await setup.cartItem.findUnique({
    where: { cartId_productId: { cartId: carts[0].id, productId: product.id } },
  });
  assert.equal(item.quantity, 3);
});

test('concurrent checkouts reserve stock once and failed transactions roll back', async () => {
  const { users, carts, addresses, product } = await fixture(5);
  await Promise.all(
    carts.map((cart) =>
      setup.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: 4 } }),
    ),
  );

  const checkouts = await Promise.allSettled([
    orderService.place(users[0].id, {
      addressId: addresses[0].id,
      idempotencyKey: randomUUID(),
    }),
    orderService.place(users[1].id, {
      addressId: addresses[1].id,
      idempotencyKey: randomUUID(),
    }),
  ]);
  assert.equal(checkouts.filter((result) => result.status === 'fulfilled').length, 1);
  assert.equal(checkouts.filter((result) => result.status === 'rejected').length, 1);
  assert.equal((await setup.product.findUnique({ where: { id: product.id } })).stock, 1);
  assert.equal(
    await setup.order.count({ where: { userId: { in: users.map(({ id }) => id) } } }),
    1,
  );

  const rollbackProduct = await setup.product.update({
    where: { id: product.id },
    data: { stock: 5 },
  });
  const deliberateFailure = new Error('deliberate rollback');
  await assert.rejects(
    orderRepository.transaction(async (tx) => {
      const reserved = await orderRepository.reserveStock(rollbackProduct.id, 2, tx);
      assert.equal(reserved.count, 1);
      throw deliberateFailure;
    }),
    (error) => error === deliberateFailure,
  );
  assert.equal((await setup.product.findUnique({ where: { id: product.id } })).stock, 5);
});

test('concurrent checkout retries with the same key return one order and reserve stock once', async () => {
  const { users, carts, addresses, product } = await fixture(5);
  await setup.cartItem.create({
    data: { cartId: carts[0].id, productId: product.id, quantity: 2 },
  });
  const input = { addressId: addresses[0].id, idempotencyKey: randomUUID() };

  const [first, second] = await Promise.all([
    orderService.place(users[0].id, input),
    orderService.place(users[0].id, input),
  ]);

  assert.equal(first.order.id, second.order.id);
  assert.equal(
    await setup.order.count({
      where: { userId: users[0].id, idempotencyKey: input.idempotencyKey },
    }),
    1,
  );
  assert.equal((await setup.product.findUnique({ where: { id: product.id } })).stock, 3);
});

test('different users can independently use the same idempotency key', async () => {
  const { users, carts, addresses, product } = await fixture(5);
  await Promise.all(
    carts.map((cart) =>
      setup.cartItem.create({ data: { cartId: cart.id, productId: product.id, quantity: 1 } }),
    ),
  );
  const idempotencyKey = randomUUID();

  const [first, second] = await Promise.all([
    orderService.place(users[0].id, { addressId: addresses[0].id, idempotencyKey }),
    orderService.place(users[1].id, { addressId: addresses[1].id, idempotencyKey }),
  ]);

  assert.notEqual(first.order.id, second.order.id);
  assert.equal(await setup.order.count({ where: { idempotencyKey } }), 2);
  assert.equal((await setup.product.findUnique({ where: { id: product.id } })).stock, 3);
});

test('reusing a key with a different address is rejected without changing stock', async () => {
  const { users, carts, addresses, product } = await fixture(5);
  const otherAddress = await setup.address.create({
    data: { ...addressData('Alternate'), userId: users[0].id, isDefault: false },
  });
  await setup.cartItem.create({
    data: { cartId: carts[0].id, productId: product.id, quantity: 2 },
  });
  const idempotencyKey = randomUUID();

  await orderService.place(users[0].id, {
    addressId: addresses[0].id,
    idempotencyKey,
  });
  await assert.rejects(
    orderService.place(users[0].id, {
      addressId: otherAddress.id,
      idempotencyKey,
    }),
    (error) => error.code === 'IDEMPOTENCY_KEY_REUSED',
  );

  assert.equal(await setup.order.count({ where: { userId: users[0].id, idempotencyKey } }), 1);
  assert.equal((await setup.product.findUnique({ where: { id: product.id } })).stock, 3);
});

test('concurrent default-address requests leave exactly one default', async () => {
  const { users } = await fixture();
  await setup.address.updateMany({ where: { userId: users[0].id }, data: { isDefault: false } });

  const results = await Promise.allSettled([
    addressService.create(users[0].id, addressData('Concurrent A')),
    addressService.create(users[0].id, addressData('Concurrent B')),
  ]);
  assert.equal(results.filter((result) => result.status === 'fulfilled').length, 2);
  assert.equal(await setup.address.count({ where: { userId: users[0].id, isDefault: true } }), 1);
});

test('PostgreSQL emits P2034 and the bounded helper retries the transaction', async () => {
  const { product } = await fixture(5);
  let waiting = 0;
  let release;
  const bothRead = new Promise((resolve) => {
    release = resolve;
  });
  let observedConflicts = 0;

  const increment = (database) => {
    let attempt = 0;
    return withTransactionRetry(() => {
      attempt += 1;
      return database
        .$transaction(
          async (tx) => {
            await tx.product.findUnique({ where: { id: product.id } });
            if (attempt === 1) {
              waiting += 1;
              if (waiting === 2) release();
              await bothRead;
            }
            return tx.product.update({
              where: { id: product.id },
              data: { stock: { increment: 1 } },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        )
        .catch((error) => {
          if (error.code === 'P2034') observedConflicts += 1;
          throw error;
        });
    });
  };

  await Promise.all([increment(connectionA), increment(connectionB)]);
  assert.ok(observedConflicts >= 1);
  assert.equal((await setup.product.findUnique({ where: { id: product.id } })).stock, 7);
});
