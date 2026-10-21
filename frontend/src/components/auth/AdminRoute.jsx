import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';
import { AdminForbiddenPage } from '@/pages/admin/AdminForbiddenPage';

export function AdminRoute() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader label="Checking access…" />
      </div>
    );
  if (!currentUser) return <Navigate to="/admin/login" replace state={{ from: location }} />;
  if (currentUser.role !== 'ADMIN') return <AdminForbiddenPage />;
  return <Outlet />;
}
