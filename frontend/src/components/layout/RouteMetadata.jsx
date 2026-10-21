import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routes = [
  [/^\/$/, 'Everyday finds, made simple'],
  [/^\/products\/[\w-]+$/, 'Product details'],
  [/^\/products$/, 'Shop groceries'],
  [/^\/cart$/, 'Your basket'],
  [/^\/checkout$/, 'Checkout'],
  [/^\/addresses$/, 'Delivery addresses'],
  [/^\/orders\/[\w-]+\/success$/, 'Order confirmed'],
  [/^\/orders\/[\w-]+$/, 'Order details'],
  [/^\/orders$/, 'My orders'],
  [/^\/(account|profile)$/, 'My account'],
  [/^\/login$/, 'Sign in'],
  [/^\/register$/, 'Create account'],
  [/^\/admin\/login$/, 'Admin sign in'],
  [/^\/admin\/dashboard$/, 'Admin dashboard'],
  [/^\/admin\/products\/new$/, 'Add product'],
  [/^\/admin\/products\/[\w-]+\/edit$/, 'Edit product'],
  [/^\/admin\/products$/, 'Manage products'],
  [/^\/admin\/categories$/, 'Manage categories'],
  [/^\/admin\/orders\/[\w-]+$/, 'Manage order'],
  [/^\/admin\/orders$/, 'Manage orders'],
];

export function RouteMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const title = routes.find(([pattern]) => pattern.test(pathname))?.[1] ?? 'Page not found';
    document.title = `${title} | Lomzi`;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        pathname.startsWith('/admin')
          ? 'Secure Lomzi administration workspace.'
          : 'Discover everyday groceries and essentials with Lomzi.',
      );
  }, [pathname]);

  return null;
}
