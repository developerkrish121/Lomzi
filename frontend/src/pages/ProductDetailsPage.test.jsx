import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { expect, test, vi } from 'vitest';
import { ProductDetailsPage } from '@/pages/ProductDetailsPage';

const useProduct = vi.fn();
vi.mock('@/features/discovery/hooks', () => ({ useProduct: (...args) => useProduct(...args) }));
vi.mock('@/components/cart/AddToCartButton', () => ({
  AddToCartButton: ({ product }) => <button type="button">Add {product.name}</button>,
}));

test('renders complete product details and related products', () => {
  const category = { id: 'c1', name: 'Fruits', slug: 'fruits' };
  const product = {
    id: 'p1',
    name: 'Royal Gala Apples',
    description: 'Crisp apples',
    price: '189',
    discountPrice: '159',
    stock: 4,
    unit: '4 pcs',
    image: 'apple.jpg',
    isAvailable: true,
    category,
  };
  useProduct.mockReturnValue({
    data: { product, relatedProducts: [{ ...product, id: 'p2', name: 'Bananas' }] },
    isPending: false,
    isError: false,
  });
  render(
    <MemoryRouter initialEntries={['/products/p1']}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetailsPage />} />
      </Routes>
    </MemoryRouter>,
  );
  expect(screen.getByRole('heading', { name: 'Royal Gala Apples' })).toBeInTheDocument();
  expect(screen.getByText('Crisp apples')).toBeInTheDocument();
  expect(screen.getByText('Bananas')).toBeInTheDocument();
  expect(screen.queryByText(/add to cart/i)).not.toBeInTheDocument();
});
