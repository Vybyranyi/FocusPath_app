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
    render(<IconButton emoji="smiling cat with heart-eyes" size="large" label="Pick a mood" />);
    expect(screen.getByRole('img', { name: 'smiling cat with heart-eyes' })).toBeInTheDocument();
  });

  it('renders an icon when icon prop is passed', () => {
    render(<IconButton icon={notification} size="large" label="Notifications" />);
    const img = screen.getByRole('button').querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', notification);
  });

  it('names itself for a screen reader', () => {
    // The button renders nothing but an image, so without this it announced
    // as a bare "button" — which is what "back" sounded like on four screens.
    render(<IconButton icon={notification} size="large" label="Notifications" />);
    expect(screen.getByRole('button', { name: 'Notifications' })).toBeInTheDocument();
  });

  it('renders button with correct size classes', () => {
    render(<IconButton size="medium" label="Menu" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('w-12');
    expect(button.className).toContain('h-12');
  });

  it('renders dot when show_dot is true', () => {
    render(<IconButton size="medium" label="Menu" show_dot />);
    const dot = screen.getByRole('button').querySelector('span');
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain('bg-danger');
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<IconButton size="large" label="Menu" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
