import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader } from '@/components/ui/Loader';
import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute() {
  const { currentUser, loading } = useAuth();
  const location = useLocation();
  if (loading)
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader label="Restoring your session…" />
      </div>
    );
  if (!currentUser) return <Navigate to="/login" replace state={{ from: location }} />;
  if (currentUser.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
}
