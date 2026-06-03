import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ToastProvider } from './Toast';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
describe('ToastProvider Component', () => {
  const mockRemoveToast = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      toasts: [
        { id: '1', message: 'Success Message', type: 'success' },
        { id: '2', message: 'Error Message', type: 'error' },
        { id: '3', message: 'Info Message', type: 'info' }
      ],
      removeToast: mockRemoveToast
    });
  });
  it('renders toasts', () => {
    render(<ToastProvider />);
    expect(screen.getByText('Success Message')).toBeInTheDocument();
    expect(screen.getByText('Error Message')).toBeInTheDocument();
    expect(screen.getByText('Info Message')).toBeInTheDocument();
  });
  it('calls removeToast when close button is clicked', () => {
    render(<ToastProvider />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBe(3);
    fireEvent.click(buttons[0]);
    expect(mockRemoveToast).toHaveBeenCalledWith('1');
  });
});