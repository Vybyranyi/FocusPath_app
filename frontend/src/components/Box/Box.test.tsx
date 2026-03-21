import { render, screen, fireEvent } from '@testing-library/react';
import Box from './Box';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: any) => <span data-testid="emoji" {...props} />,
}));

describe('Box component', () => {
  const defaultProps = {
    emoji: 'rocket',
    title: 'Test Title',
    text:  'Test text',
    color: 'blue' as const,
  };

  it('renders emoji, title and text', () => {
    render(<Box {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test text')).toBeInTheDocument();
    expect(screen.getByTestId('emoji')).toBeInTheDocument();
  });

  it('applies correct color class for blue', () => {
    const { container } = render(<Box {...defaultProps} />);
    expect(container.firstChild).toHaveClass('bg-primary-blue-20');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Box {...defaultProps} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies gradient class for gradient color', () => {
    const { container } = render(<Box {...defaultProps} color="gradient" />);
    expect(container.firstChild).toHaveClass('bg-blue-gradient');
  });

  it('applies white text on gradient variant', () => {
    render(<Box {...defaultProps} color="gradient" />);
    expect(screen.getByText('Test Title')).toHaveClass('text-base-white');
    expect(screen.getByText('Test text')).toHaveClass('text-base-white');
  });
});
