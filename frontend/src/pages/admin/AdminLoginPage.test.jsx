import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, test, vi } from 'vitest';
import { AuthContext } from '@/context/authContextValue';
import { ToastContext } from '@/context/toastContextValue';
import { AdminLoginPage } from '@/pages/admin/AdminLoginPage';

function renderPage(currentUser = null, adminLogin = vi.fn()) {
  return render(
    <ToastContext.Provider value={{ notify: vi.fn(), dismiss: vi.fn() }}>
      <AuthContext.Provider value={{ currentUser, loading: false, adminLogin }}>
        <MemoryRouter initialEntries={['/admin/login']}>
          <Routes>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/dashboard" element={<p>Admin dashboard</p>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </ToastContext.Provider>,
  );
}

describe('AdminLoginPage', () => {
  test('submits administrator credentials without exposing registration', async () => {
    const user = userEvent.setup();
    const adminLogin = vi.fn().mockResolvedValue({ role: 'ADMIN' });
    renderPage(null, adminLogin);

    expect(screen.queryByRole('link', { name: /create account/i })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Admin email'), 'admin@quickbasket.com');
    await user.type(screen.getByLabelText('Password'), 'Admin@123');
    await user.click(screen.getByRole('button', { name: 'Sign in to Admin Portal' }));

    expect(adminLogin).toHaveBeenCalledWith({
      email: 'admin@quickbasket.com',
      password: 'Admin@123',
      remember: true,
    });
    expect(await screen.findByText('Admin dashboard')).toBeInTheDocument();
  });

  test('shows the required forbidden message to authenticated customers', () => {
    renderPage({ role: 'CUSTOMER' });
    expect(
      screen.getByText('You are not authorized to access the Admin Portal.'),
    ).toBeInTheDocument();
  });
});
