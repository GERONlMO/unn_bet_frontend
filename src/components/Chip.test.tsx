import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Chip } from './Chip';
describe('Chip Component', () => {
  it('renders the amount correctly', () => {
    render(<Chip amount={500} />);
    expect(screen.getByText('500')).toBeInTheDocument();
  });
  it('renders zero amount correctly', () => {
    render(<Chip amount={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});