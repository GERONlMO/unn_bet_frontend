import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlayerSeat } from './PlayerSeat';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
describe('PlayerSeat', () => {
  const mockTakeSeat = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      takeSeat: mockTakeSeat,
      mySeatIndex: null,
      currentTable: { status: 'WAITING' }
    });
  });
  it('renders an empty seat button if table is waiting', () => {
    render(<PlayerSeat player={null} index={1} positionClass="pos" />);
    const btn = screen.getByText('Сесть').closest('button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn!);
    expect(mockTakeSeat).toHaveBeenCalledWith(1);
  });
  it('renders an empty div if table is in progress', () => {
    (useStore as any).mockReturnValue({
      takeSeat: mockTakeSeat,
      currentTable: { status: 'PLAYING' }
    });
    const { container } = render(<PlayerSeat player={null} index={1} positionClass="pos" />);
    expect(screen.queryByText('Сесть')).not.toBeInTheDocument();
    expect(container.firstChild).toHaveClass('absolute pos');
  });
  it('renders player info', () => {
    const player = { name: 'Player1', stack: 1000, status: 'active', avatarColor: 'bg-red-500' };
    render(<PlayerSeat player={player} index={1} positionClass="pos" />);
    expect(screen.getByText('Player1')).toBeInTheDocument();
    expect(screen.getByText('1000')).toBeInTheDocument();
  });
  it('renders avatar image if available', () => {
    const player = { name: 'Player1', stack: 1000, status: 'active', avatar: 'data:image/png;base64,mock', profile: { gamesPlayed: 10, wins: 5 } };
    render(<PlayerSeat player={player} index={1} positionClass="pos" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/png;base64,mock');

    fireEvent.click(img.parentElement!);
    expect(screen.getByText('Сыграно игр:')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });
  it('renders avatar image prefixing data url if missing', () => {
    const player = { name: 'Player1', stack: 1000, status: 'active', avatar: 'mockbase64' };
    render(<PlayerSeat player={player} index={1} positionClass="pos" />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', 'data:image/jpeg;base64,mockbase64');
  });
  it('renders winner badge', () => {
    (useStore as any).mockReturnValue({
      currentTable: { status: 'FINISHED', winner: 'Player1', winAmount: 500, winningCombination: 'Pair' }
    });
    const player = { name: 'Player1', stack: 1000, status: 'active' };
    render(<PlayerSeat player={player} index={1} positionClass="pos" />);
    expect(screen.getByText('+500')).toBeInTheDocument();
    expect(screen.getByText('Pair')).toBeInTheDocument();
  });
  it('handles thinking state with timer', () => {
    vi.useFakeTimers();
    (useStore as any).mockReturnValue({
      currentTable: { status: 'PLAYING', turnStartTime: Date.now(), turnTimeLimit: 30000 }
    });
    const player = { name: 'Player1', stack: 1000, status: 'thinking' };
    render(<PlayerSeat player={player} index={1} positionClass="pos" />);
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(document.querySelector('svg')).toBeInTheDocument();
    vi.useRealTimers();
  });
  it('renders fold badge', () => {
    const player = { name: 'Player1', stack: 1000, status: 'folded' };
    render(<PlayerSeat player={player} index={1} positionClass="pos" />);
    expect(screen.getByText('Fold')).toBeInTheDocument();
  });
});