import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Lobby } from './Lobby';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
vi.mock('next/navigation', () => ({
  useRouter: vi.fn()
}));
describe('Lobby', () => {
  const mockJoinTable = vi.fn();
  const mockPush = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      balance: 1500,
      joinTable: mockJoinTable,
      isLoadingTable: false
    });
    (useRouter as any).mockReturnValue({
      push: mockPush
    });
  });
  it('renders correctly', () => {
    render(<Lobby />);
    expect(screen.getByText(/1\s*[,.\u00A0]?\s*500/)).toBeInTheDocument();
    expect(screen.getByText('Доступные столы')).toBeInTheDocument();
  });
  it('renders tables', () => {
    render(<Lobby />);
    expect(screen.getByText('Новички NL10')).toBeInTheDocument();
  });
  it('calls joinTable on click', () => {
    vi.useFakeTimers();
    render(<Lobby />);

    const buttons = screen.getAllByText('СЕСТЬ');
    fireEvent.click(buttons[0]);
    expect(mockJoinTable).toHaveBeenCalledWith('lobby-1');
    vi.advanceTimersByTime(800);
    expect(mockPush).toHaveBeenCalledWith('/table/lobby-1');
    vi.useRealTimers();
  });
  it('disables buttons when loading', () => {
    (useStore as any).mockReturnValue({
      balance: 1500,
      joinTable: mockJoinTable,
      isLoadingTable: true
    });
    render(<Lobby />);
    const buttons = screen.getAllByRole('button', { name: '' });

    const button = screen.getAllByRole('button').find(b => b.disabled);
    expect(button).toBeInTheDocument();
  });
});