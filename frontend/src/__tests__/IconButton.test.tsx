import { render, screen, fireEvent } from '@testing-library/react';
import type { ComponentProps } from 'react';
import IconButton from '@components/ui/IconButton';
import { describe, expect, it, vi } from 'vitest';
import notification from '@assets/images/icons/notification.svg';

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: { name: string } & ComponentProps<'span'>) => (
    <span role="img" aria-label={props.name} {...props} />
  ),
}));

describe('IconButton component', () => {
  it('renders emoji when emoji prop is provided', () => {
    render(<IconButton emoji="smiling cat with heart-eyes" size="large" />);
    expect(screen.getByRole('img', { name: 'smiling cat with heart-eyes' })).toBeInTheDocument();
  });

  it('renders an icon when icon prop is passed', () => {
    render(<IconButton icon={notification} size="large" />);
    const img = screen.getByRole('button').querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', notification);
  });

  it('renders button with correct size classes', () => {
    render(<IconButton size="medium" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('w-10');
    expect(button.className).toContain('h-10');
  });

  it('renders dot when show_dot is true', () => {
    render(<IconButton size="medium" show_dot />);
    const dot = screen.getByRole('button').querySelector('span');
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain('bg-error');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<IconButton size="large" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
