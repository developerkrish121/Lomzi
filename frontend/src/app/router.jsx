import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { adminLoginRoute, adminRoutes } from '@/routes/adminRoutes';
import { customerRoutes } from '@/routes/customerRoutes';

export const router = createBrowserRouter([
  adminLoginRoute,
  adminRoutes,
  { element: <AppLayout />, children: customerRoutes },
]);
