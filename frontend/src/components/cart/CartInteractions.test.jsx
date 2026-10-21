import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, expect, test, vi } from 'vitest';
import { AddToCartButton } from '@/components/cart/AddToCartButton';
import { CartItem } from '@/components/cart/CartItem';

const mocks = vi.hoisted(() => ({
  addItem: vi.fn(),
  updateItem: vi.fn(),
  removeItem: vi.fn(),
  openDrawer: vi.fn(),
  notify: vi.fn(),
}));
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ currentUser: { id: 'user-1' } }) }));
vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ notify: mocks.notify }) }));
vi.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    ...mocks,
    addingProductId: null,
    pendingItemId: null,
    errorMessage: (error) => error.message,
  }),
}));

const product = {
  id: 'product-1',
  name: 'Apples',
  image: '/apple.jpg',
  unit: '4 pcs',
  stock: 5,
  isAvailable: true,
};
const item = { id: 'item-1', product, quantity: 2, unitPrice: 50, lineTotal: 100 };

beforeEach(() => {
  vi.clearAllMocks();
  mocks.addItem.mockResolvedValue({});
  mocks.updateItem.mockResolvedValue({});
  mocks.removeItem.mockResolvedValue({});
});

test('adds a product through the backend mutation and opens the synchronized drawer', async () => {
  render(
    <MemoryRouter>
      <AddToCartButton product={product} />
    </MemoryRouter>,
  );
  await userEvent.click(screen.getByRole('button', { name: /add apples/i }));
  expect(mocks.addItem).toHaveBeenCalledWith(product.id, 1);
  expect(mocks.openDrawer).toHaveBeenCalledOnce();
  expect(mocks.notify).toHaveBeenCalledWith('Apples added to your basket.');
});

test('cart item controls increase, decrease, and remove the correct item', async () => {
  render(<CartItem item={item} />);
  await userEvent.click(screen.getByRole('button', { name: /increase apples/i }));
  await userEvent.click(screen.getByRole('button', { name: /decrease apples/i }));
  await userEvent.click(screen.getByRole('button', { name: /remove/i }));
  expect(mocks.updateItem).toHaveBeenNthCalledWith(1, item.id, 3);
  expect(mocks.updateItem).toHaveBeenNthCalledWith(2, item.id, 1);
  expect(mocks.removeItem).toHaveBeenCalledWith(item.id);
});
