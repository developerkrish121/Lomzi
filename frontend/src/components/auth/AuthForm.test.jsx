import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { AuthForm } from '@/components/auth/AuthForm';

const login = vi.fn();
const register = vi.fn();
const notify = vi.fn();
vi.mock('@/hooks/useAuth', () => ({ useAuth: () => ({ login, register }) }));
vi.mock('@/hooks/useToast', () => ({ useToast: () => ({ notify }) }));

function renderForm(mode) {
  return render(
    <MemoryRouter>
      <AuthForm mode={mode} />
    </MemoryRouter>,
  );
}

describe('AuthForm', () => {
  beforeEach(() => vi.clearAllMocks());

  test('shows accessible login validation and remember-me without unused links', async () => {
    const user = userEvent.setup();
    renderForm('login');
    expect(screen.getByRole('checkbox', { name: /remember me/i })).toBeChecked();
    expect(screen.queryByText(/forgot password/i)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  test('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderForm('login');
    const password = screen.getByLabelText('Password');
    expect(password).toHaveAttribute('type', 'password');
    await user.click(screen.getByRole('button', { name: 'Show password' }));
    expect(password).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Hide password' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('validates registration fields and matching passwords without login-only controls', async () => {
    const user = userEvent.setup();
    renderForm('register');
    expect(screen.queryByRole('checkbox', { name: /remember me/i })).not.toBeInTheDocument();
    await user.type(screen.getByLabelText('Full name'), 'Asha Rao');
    await user.type(screen.getByLabelText('Email address'), 'asha@example.com');
    await user.type(screen.getByLabelText('Password'), 'password-one');
    await user.type(screen.getByLabelText('Confirm password'), 'password-two');
    await user.click(screen.getByRole('button', { name: /create account/i }));
    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });
});
