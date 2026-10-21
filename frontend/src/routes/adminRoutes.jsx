import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AdminLayout } from '@/layouts/AdminLayout';

const page = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const Dashboard = page(() => import('@/pages/admin/AdminDashboardPage'), 'AdminDashboardPage');
const Products = page(() => import('@/pages/admin/AdminProductsPage'), 'AdminProductsPage');
const ProductForm = page(
  () => import('@/pages/admin/AdminProductFormPage'),
  'AdminProductFormPage',
);
const Categories = page(() => import('@/pages/admin/AdminCategoriesPage'), 'AdminCategoriesPage');
const Orders = page(() => import('@/pages/admin/AdminOrdersPage'), 'AdminOrdersPage');
const OrderDetails = page(
  () => import('@/pages/admin/AdminOrderDetailsPage'),
  'AdminOrderDetailsPage',
);
const AdminLogin = page(() => import('@/pages/admin/AdminLoginPage'), 'AdminLoginPage');

export const adminLoginRoute = { path: '/admin/login', element: <AdminLogin /> };

export const adminRoutes = {
  path: '/admin',
  element: <AdminRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { index: true, element: <Navigate to="dashboard" replace /> },
        { path: 'dashboard', element: <Dashboard /> },
        { path: 'products', element: <Products /> },
        { path: 'products/new', element: <ProductForm /> },
        { path: 'products/:id/edit', element: <ProductForm /> },
        { path: 'categories', element: <Categories /> },
        { path: 'orders', element: <Orders /> },
        { path: 'orders/:id', element: <OrderDetails /> },
      ],
    },
  ],
};
