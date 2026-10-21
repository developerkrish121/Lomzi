import { randomUUID } from 'node:crypto';
import { beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REMEMBER_EXPIRES_IN = '30d';
process.env.AUTH_COOKIE_NAME = 'quickbasket_test_session';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { app } = await import('@/app.js');
const { userRepository } = await import('@/repositories/userRepository.js');
const { requireRole } = await import('@/middleware/requireRole.js');

let users;

beforeEach(() => {
  users = [];
  userRepository.findByEmail = async (email) => users.find((user) => user.email === email) ?? null;
  userRepository.findById = async (id) => users.find((user) => user.id === id) ?? null;
  userRepository.create = async (data) => {
    const user = {
      id: randomUUID(),
      ...data,
      role: 'CUSTOMER',
      avatar: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(user);
    return user;
  };
});

describe('authentication API', () => {
  test('registers, restores, and logs out a customer session without exposing password', async () => {
    const agent = request.agent(app);
    const registered = await agent
      .post('/api/v1/auth/register')
      .send({
        name: 'Asha Rao',
        email: 'ASHA@example.com',
        password: 'correct-horse',
        remember: true,
      })
      .expect(201);
    assert.equal(registered.body.user.email, 'asha@example.com');
    assert.equal(registered.body.user.role, 'CUSTOMER');
    assert.equal('password' in registered.body.user, false);
    assert.match(registered.headers['set-cookie'][0], /HttpOnly/);

    const restored = await agent.get('/api/v1/auth/me').expect(200);
    assert.equal(restored.body.user.id, registered.body.user.id);

    await agent.post('/api/v1/auth/logout').expect(200);
    await agent
      .get('/api/v1/auth/me')
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'TOKEN_MISSING'));
  });

  test('rejects duplicate email and invalid registration input', async () => {
    const payload = { name: 'Asha Rao', email: 'asha@example.com', password: 'correct-horse' };
    await request(app).post('/api/v1/auth/register').send(payload).expect(201);
    await request(app)
      .post('/api/v1/auth/register')
      .send(payload)
      .expect(409)
      .expect(({ body }) => assert.equal(body.error.code, 'EMAIL_IN_USE'));
    await request(app)
      .post('/api/v1/auth/register')
      .send({ ...payload, email: 'invalid', password: 'short' })
      .expect(422);
  });

  test('logs in valid users and rejects unknown email or wrong password', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Asha Rao', email: 'asha@example.com', password: 'correct-horse' })
      .expect(201);
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'correct-horse', remember: false })
      .expect(200);
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'asha@example.com', password: 'wrong-password' })
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'INVALID_CREDENTIALS'));
    await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@example.com', password: 'wrong-password' })
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'INVALID_CREDENTIALS'));
  });

  test('provides a role-checked admin login without allowing customer accounts', async () => {
    const password = 'Admin@123';
    const admin = {
      id: randomUUID(),
      name: 'Administrator',
      email: 'admin@quickbasket.com',
      password: await bcrypt.hash(password, 4),
      role: 'ADMIN',
      isActive: true,
    };
    users.push(admin);

    await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: admin.email, password, remember: true })
      .expect(200)
      .expect(({ body, headers }) => {
        assert.equal(body.user.role, 'ADMIN');
        assert.equal('password' in body.user, false);
        assert.match(headers['set-cookie'][0], /HttpOnly/);
      });

    admin.isActive = false;
    await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: admin.email, password })
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'INVALID_CREDENTIALS'));

    await request(app)
      .post('/api/v1/auth/register')
      .send({ name: 'Customer', email: 'customer@example.com', password: 'customer-password' })
      .expect(201);
    await request(app)
      .post('/api/v1/auth/admin/login')
      .send({ email: 'customer@example.com', password: 'customer-password' })
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'INVALID_CREDENTIALS'));
  });

  test('rejects expired and invalid JWTs', async () => {
    const expired = jwt.sign({ sub: randomUUID(), role: 'CUSTOMER' }, process.env.JWT_SECRET, {
      expiresIn: -1,
    });
    await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', `quickbasket_test_session=${expired}`)
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'TOKEN_EXPIRED'));
    await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', 'quickbasket_test_session=not-a-token')
      .expect(401)
      .expect(({ body }) => assert.equal(body.error.code, 'TOKEN_INVALID'));
  });
});

describe('role authorization middleware', () => {
  test('allows administrators and forbids customers', () => {
    const middleware = requireRole('ADMIN');
    let nextValue;
    middleware({ user: { role: 'ADMIN' } }, {}, (value) => {
      nextValue = value;
    });
    assert.equal(nextValue, undefined);
    middleware({ user: { role: 'CUSTOMER' } }, {}, (value) => {
      nextValue = value;
    });
    assert.equal(nextValue.statusCode, 403);
    assert.equal(nextValue.code, 'FORBIDDEN');
  });
});
