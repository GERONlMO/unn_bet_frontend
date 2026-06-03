import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from './page';
import TablePage from './table/[id]/page';
import RootLayout from './layout';
import { redirect } from 'next/navigation';
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn()
}));
vi.mock('next/font/google', () => ({
  Inter: () => ({ className: 'inter' })
}));
vi.mock('@/components/ui/Toast', () => ({ ToastProvider: () => <div data-testid="toast" /> }));
vi.mock('@/components/Table', () => ({ Table: () => <div data-testid="table" /> }));
describe('Simple App Pages', () => {
  it('Home redirects to /login', () => {
    render(<Home />);
    expect(redirect).toHaveBeenCalledWith('/login');
  });
  it('TablePage renders Table component', () => {
    const { getByTestId } = render(<TablePage />);
    expect(getByTestId('table')).toBeInTheDocument();
  });
  it('RootLayout renders children and ToastProvider', () => {
    const { getByTestId, getByText } = render(
      <RootLayout>
        <div>Child Content</div>
      </RootLayout>
    );
    expect(getByText('Child Content')).toBeInTheDocument();
    expect(getByTestId('toast')).toBeInTheDocument();
  });
});