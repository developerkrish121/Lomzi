import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ProductsPage } from '@/pages/ProductsPage';

const mocks = vi.hoisted(() => ({ categories: vi.fn(), products: vi.fn() }));
vi.mock('@/features/discovery/hooks', () => ({
  useCategories: mocks.categories,
  useProducts: mocks.products,
}));
vi.mock('@/components/cart/AddToCartButton', () => ({
  AddToCartButton: ({ product }) => <button type="button">Add {product.name}</button>,
}));

const category = {
  id: 'c1',
  name: 'Fruits',
  slug: 'fruits',
  icon: 'Apple',
  _count: { products: 1 },
};
const product = {
  id: 'p1',
  name: 'Royal Gala Apples',
  price: '189',
  discountPrice: '159',
  stock: 4,
  unit: '4 pcs',
  image: 'apple.jpg',
  isAvailable: true,
  category,
};
const Location = () => <output data-testid="location">{useLocation().search}</output>;

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/products']}>
      <Routes>
        <Route
          path="/products"
          element={
            <>
              <ProductsPage />
              <Location />
            </>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductsPage', () => {
  beforeEach(() => {
    mocks.categories.mockReturnValue({ data: [category], isPending: false });
    mocks.products.mockReturnValue({
      data: { products: [product], pagination: { page: 1, total: 13, totalPages: 2 } },
      isPending: false,
      isError: false,
    });
  });

  test('renders products and updates search, category and pagination in the URL', async () => {
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByText('Royal Gala Apples')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Fruits' }));
    expect(screen.getByTestId('location')).toHaveTextContent('category=fruits');
    await user.type(screen.getByLabelText('Search products'), 'apple');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByTestId('location')).toHaveTextContent('q=apple');
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByTestId('location')).toHaveTextContent('page=2');
  });

  test('renders loading and error states with a functional retry', async () => {
    const refetch = vi.fn();
    mocks.products.mockReturnValueOnce({ isPending: true, isError: false });
    const loading = renderPage();
    expect(screen.getByText('Loading products…')).toBeInTheDocument();
    loading.unmount();
    mocks.products.mockReturnValue({
      isPending: false,
      isError: true,
      error: new Error('Network unavailable'),
      refetch,
    });
    const user = userEvent.setup();
    renderPage();
    expect(screen.getByRole('alert')).toHaveTextContent('Network unavailable');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalledOnce();
  });
});
