import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Card } from './Card';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
describe('Card Component', () => {
  beforeEach(() => {
    (useStore as any).mockReturnValue({
      profile: {
        settings: { cardBack: 'blue', cardFront: 'classic' }
      }
    });
  });
  it('renders a hidden card when hidden is true', () => {
    const { container } = render(<Card hidden />);
    expect(container.firstElementChild).toHaveClass('from-blue-800');
  });
  it('renders a hidden card explicitly', () => {
    const { container } = render(<Card hidden={true} value={{ value: 14, suit: 'Spades' }} />);
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });
  it('renders a string card correctly', () => {
    render(<Card value="Ah" />);
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('♥')).toBeInTheDocument();
  });
  it('renders a CardData object correctly', () => {
    render(<Card value={{ value: 10, suit: 'Diamonds' }} />);
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('♦')).toBeInTheDocument();
  });
  it('handles empty cards from object', () => {
    const { container } = render(<Card value={{ value: -1, suit: 'empty' }} />);
    expect(container.firstElementChild).toHaveClass('from-blue-800');
  });
  describe('Card Styles Settings', () => {
    it('applies red back style', () => {
      (useStore as any).mockReturnValue({ profile: { settings: { cardBack: 'red' } } });
      const { container } = render(<Card hidden />);
      expect(container.firstElementChild).toHaveClass('from-red-800');
    });
    it('applies dark front style', () => {
      (useStore as any).mockReturnValue({ profile: { settings: { cardFront: 'dark' } } });
      render(<Card value="Ah" />);
      expect(screen.getByText('A').parentElement?.parentElement).toHaveClass('bg-zinc-800');
    });
    it('applies four-color front style', () => {
      (useStore as any).mockReturnValue({ profile: { settings: { cardFront: 'four-color' } } });
      render(<Card value="Ah" />);
      const el = screen.getByText('A').parentElement?.parentElement;
      expect(el).toHaveClass('text-red-500');
    });
  });
});