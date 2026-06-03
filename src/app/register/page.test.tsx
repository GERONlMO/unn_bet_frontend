import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './page';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));
vi.mock('@/lib/api', () => ({
  apiClient: { post: vi.fn() }
}));
vi.mock('@/lib/crypto', () => ({
  fetchPublicKey: vi.fn().mockResolvedValue('key'),
  encryptData: vi.fn((key, data) => `enc-${data}`)
}));
describe('RegisterPage', () => {
  const mockAddToast = vi.fn();
  const mockPush = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({ addToast: mockAddToast });
    (useRouter as any).mockReturnValue({ push: mockPush });
  });
  it('validates empty fields', () => {
    render(<RegisterPage />);
    fireEvent.click(screen.getByText('Зарегистрироваться'));
    expect(mockAddToast).toHaveBeenCalledWith('Заполните все поля', 'error');
  });
  it('validates email format', () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('player@unn.bet'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByPlaceholderText('Player123'), { target: { value: 'user1' } });
    const pwInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwInputs[0], { target: { value: 'pass123' } });
    fireEvent.change(pwInputs[1], { target: { value: 'pass123' } });
    fireEvent.click(screen.getByText('Зарегистрироваться'));
    expect(mockAddToast).toHaveBeenCalledWith('Введите корректный email адрес', 'error');
  });
  it('validates password match', () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('player@unn.bet'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Player123'), { target: { value: 'user_1' } });
    const pwInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwInputs[0], { target: { value: 'pass123' } });
    fireEvent.change(pwInputs[1], { target: { value: 'pass456' } });
    fireEvent.click(screen.getByText('Зарегистрироваться'));
    expect(mockAddToast).toHaveBeenCalledWith('Пароли не совпадают', 'error');
  });
  it('registers successfully', async () => {
    render(<RegisterPage />);
    fireEvent.change(screen.getByPlaceholderText('player@unn.bet'), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Player123'), { target: { value: 'user_1' } });
    const pwInputs = screen.getAllByPlaceholderText('••••••••');
    fireEvent.change(pwInputs[0], { target: { value: 'pass123' } });
    fireEvent.change(pwInputs[1], { target: { value: 'pass123' } });
    vi.mocked(apiClient.post).mockResolvedValueOnce({});
    fireEvent.click(screen.getByText('Зарегистрироваться'));
    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalled();
    });
    expect(mockPush).toHaveBeenCalledWith('/login');
  });
});