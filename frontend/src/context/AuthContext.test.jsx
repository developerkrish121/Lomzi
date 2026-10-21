import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';

vi.mock('@/lib/apiClient', () => ({ apiClient: { get: vi.fn(), post: vi.fn() } }));

const user = { id: 'user-1', name: 'Asha Rao', email: 'asha@example.com', role: 'CUSTOMER' };
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('AuthProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  test('restores the current user from the persistent server session', async () => {
    apiClient.get.mockResolvedValue({ data: { user } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.currentUser).toEqual(user);
    expect(result.current.isAuthenticated).toBe(true);
    expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
  });

  test('logs in, registers, and logs out through the real API contract', async () => {
    apiClient.get.mockRejectedValue({ response: { status: 401 } });
    apiClient.post
      .mockResolvedValueOnce({ data: { user } })
      .mockResolvedValueOnce({ data: { user } })
      .mockResolvedValueOnce({ data: { user: { ...user, role: 'ADMIN' } } })
      .mockResolvedValueOnce({ data: { success: true } });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() =>
      result.current.login({ email: user.email, password: 'password', remember: true }),
    );
    expect(result.current.currentUser).toEqual(user);
    expect(apiClient.post).toHaveBeenNthCalledWith(
      1,
      '/auth/login',
      expect.objectContaining({ remember: true }),
    );

    await act(() =>
      result.current.register({ name: user.name, email: user.email, password: 'password' }),
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(2, '/auth/register', expect.any(Object));

    await act(() =>
      result.current.adminLogin({ email: 'admin@quickbasket.com', password: 'Admin@123' }),
    );
    expect(apiClient.post).toHaveBeenNthCalledWith(3, '/auth/admin/login', expect.any(Object));

    await act(() => result.current.logout());
    expect(apiClient.post).toHaveBeenNthCalledWith(4, '/auth/logout');
    expect(result.current.currentUser).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
