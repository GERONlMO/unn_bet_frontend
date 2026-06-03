import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './page';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));
describe('LoginPage', () => {
  const mockLogin = vi.fn();
  const mockAddToast = vi.fn();
  const mockPush = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      login: mockLogin,
      addToast: mockAddToast
    });
    (useRouter as any).mockReturnValue({ push: mockPush });
  });
  it('renders login form', () => {
    render(<LoginPage />);
    expect(screen.getByText('Вход в аккаунт')).toBeInTheDocument();
  });
  it('shows error if fields are empty', () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByText('Войти'));
    expect(mockAddToast).toHaveBeenCalledWith('Заполните все поля', 'error');
  });
  it('calls login and redirects on success', async () => {
    render(<LoginPage />);
    const inputs = screen.getAllByRole('textbox'); 
    const usernameInput = inputs[0];
    const passwordInput = screen.getByPlaceholderText('••••••••');
    fireEvent.change(usernameInput, { target: { value: 'user1' } });
    fireEvent.change(passwordInput, { target: { value: 'pass123' } });
    fireEvent.click(screen.getByText('Войти'));
    expect(mockLogin).toHaveBeenCalledWith('user1', 'pass123');

    await Promise.resolve();
    expect(mockPush).toHaveBeenCalledWith('/lobby');
  });
  it('toggles password visibility', () => {
    render(<LoginPage />);
    const passwordInput = screen.getByPlaceholderText('••••••••');
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleBtn = passwordInput.nextElementSibling;
    fireEvent.click(toggleBtn!);
    expect(passwordInput).toHaveAttribute('type', 'text');
  });
});