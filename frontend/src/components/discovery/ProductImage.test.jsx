import { fireEvent, render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { PRODUCT_IMAGE_FALLBACK, ProductImage } from '@/components/discovery/ProductImage';

test('replaces a failed product image with the local fallback', () => {
  render(<ProductImage src="https://example.com/missing.jpg" alt="Test product" />);

  const image = screen.getByRole('img', { name: 'Test product' });
  expect(image).toHaveAttribute('src', 'https://example.com/missing.jpg');

  fireEvent.error(image);

  expect(image).toHaveAttribute('src', PRODUCT_IMAGE_FALLBACK);
});
