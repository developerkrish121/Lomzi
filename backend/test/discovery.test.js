import assert from 'node:assert/strict';
import { beforeEach, describe, test } from 'node:test';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/quickbasket_test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-thirty-two-characters';
register('../src/alias-loader.js', pathToFileURL('./test/'));

const { app } = await import('@/app.js');
const { categoryRepository } = await import('@/repositories/categoryRepository.js');
const { productRepository } = await import('@/repositories/productRepository.js');

const category = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Fruits',
  slug: 'fruits',
  icon: 'Apple',
  _count: { products: 1 },
};
const product = {
  id: '123e4567-e89b-12d3-a456-426614174001',
  name: 'Royal Gala Apples',
  slug: 'royal-gala-apples',
  description: 'Crisp apples',
  price: '189.00',
  discountPrice: '159.00',
  stock: 10,
  unit: '4 pcs',
  image: 'https://example.com/apple.jpg',
  isAvailable: true,
  categoryId: category.id,
  category,
};
let receivedFilters;

beforeEach(() => {
  receivedFilters = null;
  categoryRepository.findAll = async () => [category];
  categoryRepository.findBySlug = async (slug) => (slug === category.slug ? category : null);
  productRepository.findPage = async (filters) => {
    receivedFilters = filters;
    return { items: [product], total: 13 };
  };
  productRepository.findById = async (id) => (id === product.id ? product : null);
  productRepository.findRelated = async () => [
    { ...product, id: '123e4567-e89b-12d3-a456-426614174002', name: 'Bananas' },
  ];
});

describe('product discovery API', () => {
  test('loads categories with product counts', async () => {
    const response = await request(app).get('/api/v1/categories').expect(200);
    assert.equal(response.body.categories[0].slug, 'fruits');
    assert.equal(response.body.categories[0]._count.products, 1);
  });

  test('lists products with validated pagination, filtering and sorting', async () => {
    const response = await request(app)
      .get('/api/v1/products?page=2&limit=6&category=fruits&sort=price-asc')
      .expect(200);
    assert.deepEqual(receivedFilters, {
      page: 2,
      limit: 6,
      q: '',
      category: 'fruits',
      sort: 'price-asc',
    });
    assert.equal(response.body.pagination.totalPages, 3);
    assert.equal(response.body.products[0].name, product.name);
  });

  test('searches name, description and category through the search contract', async () => {
    const response = await request(app).get('/api/v1/products/search?q=apple').expect(200);
    assert.equal(receivedFilters.q, 'apple');
    assert.equal(response.body.query, 'apple');
    await request(app).get('/api/v1/products/search?q=a').expect(422);
  });

  test('filters by category and returns a meaningful missing-category response', async () => {
    const response = await request(app).get('/api/v1/products/category/fruits?limit=4').expect(200);
    assert.equal(response.body.category.slug, 'fruits');
    assert.equal(receivedFilters.category, 'fruits');
    await request(app)
      .get('/api/v1/products/category/not-real')
      .expect(404)
      .expect(({ body }) => assert.equal(body.error.code, 'CATEGORY_NOT_FOUND'));
  });

  test('returns product details, related products and validates ids', async () => {
    const response = await request(app).get(`/api/v1/products/${product.id}`).expect(200);
    assert.equal(response.body.product.id, product.id);
    assert.equal(response.body.relatedProducts.length, 1);
    await request(app).get('/api/v1/products/not-a-uuid').expect(422);
    await request(app).get('/api/v1/products/123e4567-e89b-12d3-a456-426614174099').expect(404);
  });
});
