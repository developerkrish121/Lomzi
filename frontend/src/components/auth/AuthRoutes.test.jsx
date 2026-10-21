import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test } from 'vitest';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AuthContext } from '@/context/authContextValue';

function renderRoutes(currentUser) {
  const value = { currentUser, loading: false };
  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter initialEntries={['/secure']}>
        <Routes>
          <Route path="/admin/login" element={<p>Admin login page</p>} />
          <Route path="/admin/dashboard" element={<p>Dashboard page</p>} />
          <Route path="/login" element={<p>Login page</p>} />
          <Route path="/account" element={<p>Account page</p>} />
          <Route element={<ProtectedRoute />}>
            <Route path="/secure" element={<p>Protected content</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('authentication route guards', () => {
  test('redirects signed-out visitors and allows authenticated users', () => {
    const view = renderRoutes(null);
    expect(screen.getByText('Login page')).toBeInTheDocument();
    view.unmount();
    renderRoutes({ role: 'CUSTOMER' });
    expect(screen.getByText('Protected content')).toBeInTheDocument();
    const admin = renderRoutes({ role: 'ADMIN' });
    expect(screen.getByText('Dashboard page')).toBeInTheDocument();
    admin.unmount();
  });

  test('allows only administrators through AdminRoute', () => {
    const renderAdmin = (role) =>
      render(
        <AuthContext.Provider value={{ currentUser: role ? { role } : null, loading: false }}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/admin/login" element={<p>Admin login page</p>} />
              <Route path="/account" element={<p>Account page</p>} />
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<p>Admin content</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthContext.Provider>,
      );
    const customer = renderAdmin('CUSTOMER');
    expect(screen.getByText('Administrator access required')).toBeInTheDocument();
    customer.unmount();
    const administrator = renderAdmin('ADMIN');
    expect(screen.getByText('Admin content')).toBeInTheDocument();
    administrator.unmount();
    renderAdmin(null);
    expect(screen.getByText('Admin login page')).toBeInTheDocument();
  });
});
