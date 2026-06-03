import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PokerHandsGuide } from './PokerHandsGuide';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
describe('PokerHandsGuide', () => {
  beforeEach(() => {
    (useStore as any).mockReturnValue({
      currentTable: null,
      profile: { nickname: 'testuser' }
    });
  });
  it('renders button and toggles guide', () => {
    render(<PokerHandsGuide />);
    const btn = screen.getByText('Комбинации').closest('button');

    expect(screen.queryByText('Комбинации (от старшей)')).not.toBeInTheDocument();

    fireEvent.click(btn!);
    expect(screen.getByText('Комбинации (от старшей)')).toBeInTheDocument();

    const closeBtn = screen.getByText('Комбинации (от старшей)').nextElementSibling;
    fireEvent.click(closeBtn!);
  });
  it('highlights current hand', () => {
    (useStore as any).mockReturnValue({
      currentTable: {
        status: 'PLAYING',
        playerStates: {
          'testuser': { cards: [{ value: 14, suit: 'Spades' }, { value: 14, suit: 'Hearts' }] }
        },
        tableDeck: { cards: [{ value: 2, suit: 'Diamonds' }, { value: 3, suit: 'Clubs' }, { value: 4, suit: 'Spades' }] }
      },
      profile: { nickname: 'testuser' }
    });
    render(<PokerHandsGuide />);
    fireEvent.click(screen.getByText('Комбинации').closest('button')!);

    const badge = screen.getByText('Ваша');
    expect(badge).toBeInTheDocument();
    expect(badge.closest('.p-2')).toHaveTextContent(/Пара/i);
  });
});