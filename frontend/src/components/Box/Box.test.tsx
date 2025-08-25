import { render, screen, fireEvent } from '@testing-library/react';
import Box from './Box';
import styles from './Box.module.scss';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: any) => <span data-testid="emoji" {...props} />,
}));

describe('Box component', () => {
  const defaultProps = {
    emoji: 'rocket',
    title: 'Test Title',
    text: 'Test text',
    color: 'blue' as const,
  };

  it('renders emoji, title and text', () => {
    render(<Box {...defaultProps} />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test text')).toBeInTheDocument();
    expect(screen.getByTestId('emoji')).toBeInTheDocument();
  });

  it('applies correct color class', () => {
    const { container } = render(<Box {...defaultProps} />);
    expect(container.firstChild).toHaveClass(styles.blue);
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Box {...defaultProps} onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies gradient styles correctly', () => {
    const { container } = render(
      <Box {...defaultProps} color="gradient" />
    );
    expect(container.firstChild).toHaveClass(styles.gradient);

    const title = screen.getByText('Test Title');
    const text = screen.getByText('Test text');
    expect(title).toHaveClass(styles.title);
    expect(text).toHaveClass(styles.text);
  });
});
