import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it } from 'vitest';

import { RouteMetadata } from './RouteMetadata.jsx';

describe('RouteMetadata', () => {
  let description;

  afterEach(() => {
    description?.remove();
    description = undefined;
  });

  function renderRoute(pathname) {
    description = document.createElement('meta');
    description.setAttribute('name', 'description');
    document.head.append(description);

    render(
      <MemoryRouter initialEntries={[pathname]}>
        <RouteMetadata />
      </MemoryRouter>,
    );
  }

  it('uses Lomzi customer metadata', () => {
    renderRoute('/products');

    expect(document.title).toBe('Shop groceries | Lomzi');
    expect(description).toHaveAttribute(
      'content',
      'Discover everyday groceries and essentials with Lomzi.',
    );
  });

  it('uses Lomzi administration metadata', () => {
    renderRoute('/admin/dashboard');

    expect(document.title).toBe('Admin dashboard | Lomzi');
    expect(description).toHaveAttribute('content', 'Secure Lomzi administration workspace.');
  });
});
