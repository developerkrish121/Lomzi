import { lazy } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

const page = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const HomePage = page(() => import('@/pages/HomePage'), 'HomePage');
const LoadingPage = page(() => import('@/pages/LoadingPage'), 'LoadingPage');
const NotFoundPage = page(() => import('@/pages/NotFoundPage'), 'NotFoundPage');
const AccountPage = page(() => import('@/pages/AccountPage'), 'AccountPage');
const Login = page(() => import('@/pages/auth/Login'), 'Login');
const Register = page(() => import('@/pages/auth/Register'), 'Register');
const ProductsPage = page(() => import('@/pages/ProductsPage'), 'ProductsPage');
const ProductDetailsPage = page(() => import('@/pages/ProductDetailsPage'), 'ProductDetailsPage');
const CartPage = page(() => import('@/pages/CartPage'), 'CartPage');
const CheckoutPage = page(() => import('@/pages/CheckoutPage'), 'CheckoutPage');
const AddressPage = page(() => import('@/pages/AddressPage'), 'AddressPage');
const OrdersPage = page(() => import('@/pages/OrdersPage'), 'OrdersPage');
const OrderDetailsPage = page(() => import('@/pages/OrderDetailsPage'), 'OrderDetailsPage');
const OrderSuccessPage = page(() => import('@/pages/OrderSuccessPage'), 'OrderSuccessPage');

export const customerRoutes = [
  { path: '/', element: <HomePage /> },
  { path: '/loading', element: <LoadingPage /> },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/products', element: <ProductsPage /> },
  { path: '/products/:id', element: <ProductDetailsPage /> },
  { path: '/product/:id', element: <ProductDetailsPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/account', element: <AccountPage /> },
      { path: '/profile', element: <AccountPage /> },
      { path: '/cart', element: <CartPage /> },
      { path: '/checkout', element: <CheckoutPage /> },
      { path: '/addresses', element: <AddressPage /> },
      { path: '/orders', element: <OrdersPage /> },
      { path: '/orders/:id', element: <OrderDetailsPage /> },
      { path: '/orders/:id/success', element: <OrderSuccessPage /> },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
];
