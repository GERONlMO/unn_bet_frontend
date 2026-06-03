import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Table } from './Table';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));

vi.mock('./PlayerSeat', () => ({
  PlayerSeat: ({ player, index }: any) => <div data-testid={`seat-${index}`}>{player?.name || 'Empty'}</div>
}));
vi.mock('./Card', () => ({
  Card: ({ hidden, value }: any) => <div data-testid="card">{hidden ? 'Hidden' : value?.suit}</div>
}));
vi.mock('./ActionPanel', () => ({
  ActionPanel: () => <div data-testid="action-panel" />
}));
vi.mock('./PokerHandsGuide', () => ({
  PokerHandsGuide: () => <div data-testid="poker-hands-guide" />
}));
describe('Table', () => {
  const mockLeaveTable = vi.fn();
  const mockToggleReady = vi.fn();
  const mockAddToast = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders nothing if currentTable is null', () => {
    (useStore as any).mockReturnValue({
      currentTable: null,
      profile: { settings: { background: 'classic' } }
    });
    const { container } = render(<Table />);
    expect(container).toBeEmptyDOMElement();
  });
  it('renders table elements', () => {
    (useStore as any).mockReturnValue({
      currentTable: {
        name: 'Test Room',
        minBet: 10,
        pot: 500,
        maxPlayers: 6,
        status: 'WAITING',
        players: [],
        seats: {},
      },
      profile: { settings: { background: 'classic' }, nickname: 'test' },
      leaveTable: mockLeaveTable,
      mySeatIndex: null,
      isReady: false,
      playerBalances: {}
    });
    render(<Table />);
    expect(screen.getByText('Test Room')).toBeInTheDocument();
    expect(screen.getAllByText('500').length).toBeGreaterThan(0); 
    expect(screen.getByText('Назад в лобби')).toBeInTheDocument();

    expect(screen.getAllByTestId(/seat-/).length).toBe(6);
  });
  it('renders ready button when seated and waiting', () => {
    (useStore as any).mockReturnValue({
      currentTable: {
        name: 'Test Room',
        status: 'WAITING',
        players: [],
        seats: { '0': 'test' },
      },
      profile: { settings: { background: 'classic' }, nickname: 'test' },
      mySeatIndex: 0,
      isReady: false,
      toggleReady: mockToggleReady,
      playerBalances: {}
    });
    render(<Table />);
    const btn = screen.getByText('ГОТОВ').closest('button');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn!);
    expect(mockToggleReady).toHaveBeenCalled();
  });
  it('renders action panel when in progress and my turn', () => {
    (useStore as any).mockReturnValue({
      currentTable: {
        name: 'Test Room',
        status: 'IN_PROGRESS',
        currentTurn: 'test',
        players: [],
        seats: { '0': 'test' },
      },
      profile: { settings: { background: 'classic' }, nickname: 'test' },
      mySeatIndex: 0,
      playerBalances: {}
    });
    render(<Table />);
    expect(screen.getByTestId('action-panel')).toBeInTheDocument();
  });
  it('renders my cards', () => {
    (useStore as any).mockReturnValue({
      currentTable: {
        name: 'Test Room',
        status: 'IN_PROGRESS',
        playerStates: {
          'test': { cards: [{ value: 14, suit: 'Spades' }] }
        },
        players: [],
      },
      profile: { settings: { background: 'classic' }, nickname: 'test' },
      mySeatIndex: 0,
      playerBalances: {}
    });
    render(<Table />);
    expect(screen.getAllByTestId('card').length).toBeGreaterThan(0);
  });
  it('calls leaveTable', () => {
    (useStore as any).mockReturnValue({
      currentTable: { name: 'Test Room', status: 'WAITING', players: [] },
      profile: { settings: { background: 'classic' }, nickname: 'test' },
      mySeatIndex: null,
      leaveTable: mockLeaveTable,
      playerBalances: {}
    });
    render(<Table />);
    fireEvent.click(screen.getByText('Назад в лобби').closest('button')!);
    expect(mockLeaveTable).toHaveBeenCalled();
  });
  it('shows toast when clicking action panel wrapper if not my turn', () => {
    (useStore as any).mockReturnValue({
      currentTable: {
        name: 'Test Room',
        status: 'IN_PROGRESS',
        currentTurn: 'otherUser',
        players: [],
        seats: { '0': 'test' },
      },
      profile: { settings: { background: 'classic' }, nickname: 'test' },
      mySeatIndex: 0,
      addToast: mockAddToast,
      playerBalances: {}
    });
    render(<Table />);
    const wrapper = screen.getByTestId('action-panel').parentElement?.parentElement;
    fireEvent.click(wrapper!);
    expect(mockAddToast).toHaveBeenCalledWith('Сейчас не ваш ход', 'info');
  });
});