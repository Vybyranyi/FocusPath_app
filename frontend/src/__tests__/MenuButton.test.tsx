import { render, screen, fireEvent } from '@testing-library/react';
import MenuButton from '@components/ui/MenuButton';
import { describe, expect, it, vi } from 'vitest';

/**
 * The icons are inline SVG drawn in `currentColor` rather than eight image
 * files, so these assert what a user can actually perceive — the button's
 * name and whether it reads as the current destination — instead of which
 * file landed in a `src`.
 */
describe('MenuButton component', () => {
  it('names the destination for a screen reader', () => {
    render(<MenuButton icon="home" label="Home" />);
    expect(screen.getByRole('button', { name: 'Home' })).toBeInTheDocument();
  });

  it('renders an icon', () => {
    render(<MenuButton icon="home" label="Home" />);
    expect(screen.getByRole('button').querySelector('svg')).toBeInTheDocument();
  });

  it('carries the accent colour when active', () => {
    render(<MenuButton icon="home" label="Home" active />);
    expect(screen.getByRole('button').className).toContain('text-accent');
  });

  it('is muted when not active', () => {
    render(<MenuButton icon="home" label="Home" active={false} />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('text-ink-muted');
    expect(button.className).not.toContain('text-accent');
  });

  it.each(['home', 'explore', 'activity', 'profile'] as const)(
    'renders the %s destination',
    (icon) => {
      render(<MenuButton icon={icon} label={icon} />);
      expect(screen.getByRole('button', { name: icon })).toBeInTheDocument();
    },
  );

  it('meets the minimum touch target', () => {
    // The bar is the app's primary navigation and every target in it used to
    // be 24x24, roughly a third of the recommended area.
    render(<MenuButton icon="home" label="Home" />);
    const button = screen.getByRole('button');
    expect(button.className).toContain('min-w-11');
    expect(button.className).toContain('min-h-11');
  });

  it('renders dot notification when dot prop is true', () => {
    render(<MenuButton icon="home" label="Home" dot />);
    const dot = screen.getByRole('button').querySelector('span');
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain('bg-danger');
  });

  it('does not render dot when dot prop is false', () => {
    render(<MenuButton icon="home" label="Home" dot={false} />);
    expect(screen.getByRole('button').querySelector('span')).not.toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const handleClick = vi.fn();
    render(<MenuButton icon="home" label="Home" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('works with combination of props', () => {
    const handleClick = vi.fn();
    render(<MenuButton icon="activity" label="Activity" active dot onClick={handleClick} />);
    const button = screen.getByRole('button', { name: 'Activity' });
    expect(button.className).toContain('text-accent');
    expect(button.querySelector('span')).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
