import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InteractiveBackground } from './InteractiveBackground';
import { useStore } from '@/store/useStore';
vi.mock('@/store/useStore', () => ({
  useStore: vi.fn()
}));
describe('InteractiveBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const renderWithTheme = (bg: string) => {
    (useStore as any).mockReturnValue({
      profile: { settings: { background: bg } }
    });
    return render(
      <InteractiveBackground>
        <div>Content</div>
      </InteractiveBackground>
    );
  };
  it('renders children', () => {
    renderWithTheme('classic');
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  it('applies classic/default theme', () => {
    const { container } = renderWithTheme('classic');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(24, 24, 27)' }); 
  });
  it('applies neon theme', () => {
    const { container } = renderWithTheme('neon');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(11, 12, 16)' }); 
  });
  it('applies casino theme', () => {
    const { container } = renderWithTheme('casino');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(42, 8, 0)' }); 
  });
  it('applies matrix theme', () => {
    const { container } = renderWithTheme('matrix');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(0, 17, 0)' }); 
  });
  it('applies ocean theme', () => {
    const { container } = renderWithTheme('ocean');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(0, 10, 31)' }); 
  });
  it('applies lava theme', () => {
    const { container } = renderWithTheme('lava');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(26, 5, 0)' }); 
  });
  it('applies dark theme', () => {
    const { container } = renderWithTheme('dark');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(0, 0, 0)' }); 
  });
  it('applies none theme', () => {
    const { container } = renderWithTheme('none');
    expect(container.firstChild).toHaveStyle({ backgroundColor: 'rgb(9, 9, 11)' }); 
  });
  it('handles mousemove', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => { cb(0); return 1; });
    renderWithTheme('neon');
    fireEvent.mouseMove(window, { clientX: 100, clientY: 100 });
    vi.runAllTimers();
    vi.useRealTimers();
  });
});