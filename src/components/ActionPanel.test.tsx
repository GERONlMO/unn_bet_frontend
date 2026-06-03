import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ActionPanel } from './ActionPanel';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
describe('ActionPanel', () => {
  const mockGameAction = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders Check and Fold buttons when amountToCall is 0', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        minBet: 10,
        currentHighestBet: 0,
        playerStates: {
          'test': { currentBet: 0, balance: 1000 }
        }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    expect(screen.getByText('Check')).toBeInTheDocument();
    expect(screen.getByText('Fold')).toBeInTheDocument();
    expect(screen.getByText('Raise')).toBeInTheDocument();
  });
  it('renders Call button when amountToCall > 0', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        minBet: 10,
        currentHighestBet: 50,
        playerStates: {
          'test': { currentBet: 10, balance: 1000 }
        }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    expect(screen.getByText('Call 40')).toBeInTheDocument();
    expect(screen.queryByText('Check')).not.toBeInTheDocument();
  });
  it('renders All In Call when amountToCall >= myStack', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        minBet: 10,
        currentHighestBet: 2000,
        playerStates: {
          'test': { currentBet: 10, balance: 500 } 
        }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    expect(screen.getByText('ALL IN 500')).toBeInTheDocument();
  });
  it('calls gameAction on button clicks', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        minBet: 10,
        currentHighestBet: 0,
        playerStates: { 'test': { currentBet: 0, balance: 1000 } }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    fireEvent.click(screen.getByText('Check'));
    expect(mockGameAction).toHaveBeenCalledWith('check');
    fireEvent.click(screen.getByText('Fold'));
    expect(mockGameAction).toHaveBeenCalledWith('fold');
    fireEvent.click(screen.getByText('Raise'));
    expect(mockGameAction).toHaveBeenCalledWith('raise', 10);
  });
  it('updates bet size correctly', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        minBet: 10,
        currentHighestBet: 0,
        playerStates: { 'test': { currentBet: 0, balance: 1000 } }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    const input = screen.getByRole('spinbutton'); 
    fireEvent.change(input, { target: { value: '50' } });
    fireEvent.click(screen.getByText('Raise'));
    expect(mockGameAction).toHaveBeenCalledWith('raise', 50);
  });
  it('slider ALL IN button', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        minBet: 10,
        currentHighestBet: 0,
        playerStates: { 'test': { currentBet: 0, balance: 1000 } }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    fireEvent.click(screen.getByText('ALL IN'));
  });
  it('covers myStack and minRaise branches', () => {
    (useStore as any).mockReturnValue({
      gameAction: mockGameAction,
      currentTable: {
        currentHighestBet: 20,
        playerStates: {},
        playerBalances: { 'test': 2500 }
      },
      profile: { nickname: 'test' },
      playerBalances: {}
    });
    render(<ActionPanel />);
    expect(screen.getByText('Call 20')).toBeInTheDocument();
  });
});