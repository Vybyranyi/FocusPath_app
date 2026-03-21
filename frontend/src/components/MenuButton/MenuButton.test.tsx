import { render, screen, fireEvent } from '@testing-library/react';
import MenuButton from './MenuButton';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@assets/images/icons/home.svg',         () => ({ default: 'home.svg' }));
vi.mock('@assets/images/icons/home_active.svg',  () => ({ default: 'home_active.svg' }));
vi.mock('@assets/images/icons/explore.svg',      () => ({ default: 'explore.svg' }));
vi.mock('@assets/images/icons/explore_active.svg',() => ({ default: 'explore_active.svg' }));
vi.mock('@assets/images/icons/activity.svg',     () => ({ default: 'activity.svg' }));
vi.mock('@assets/images/icons/activity_active.svg',() => ({ default: 'activity_active.svg' }));
vi.mock('@assets/images/icons/profile.svg',      () => ({ default: 'profile.svg' }));
vi.mock('@assets/images/icons/profile_active.svg',() => ({ default: 'profile_active.svg' }));

describe('MenuButton component', () => {
  it('renders button with home icon', () => {
    render(<MenuButton icon="home" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
    const icon = screen.getByRole('img', { name: 'home' });
    expect(icon).toHaveAttribute('src', 'home.svg');
  });

  it('renders active icon when active prop is true', () => {
    render(<MenuButton icon="home" active />);
    expect(screen.getByRole('img', { name: 'home' })).toHaveAttribute('src', 'home_active.svg');
  });

  it('renders default icon when active prop is false', () => {
    render(<MenuButton icon="home" active={false} />);
    expect(screen.getByRole('img', { name: 'home' })).toHaveAttribute('src', 'home.svg');
  });

  it('renders explore, activity, profile icons correctly', () => {
    const { rerender } = render(<MenuButton icon="explore" />);
    expect(screen.getByRole('img', { name: 'explore' })).toHaveAttribute('src', 'explore.svg');

    rerender(<MenuButton icon="activity" />);
    expect(screen.getByRole('img', { name: 'activity' })).toHaveAttribute('src', 'activity.svg');

    rerender(<MenuButton icon="profile" />);
    expect(screen.getByRole('img', { name: 'profile' })).toHaveAttribute('src', 'profile.svg');
  });

  it('renders dot notification when dot prop is true', () => {
    render(<MenuButton icon="home" dot />);
    const dot = screen.getByRole('button').querySelector('span');
    expect(dot).toBeInTheDocument();
    expect(dot?.className).toContain('bg-error');
  });

  it('does not render dot when dot prop is false', () => {
    render(<MenuButton icon="home" dot={false} />);
    expect(screen.getByRole('button').querySelector('span')).not.toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const handleClick = vi.fn();
    render(<MenuButton icon="home" onClick={handleClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('works with combination of props', () => {
    const handleClick = vi.fn();
    render(<MenuButton icon="activity" active dot onClick={handleClick} />);
    expect(screen.getByRole('img', { name: 'activity' })).toHaveAttribute('src', 'activity_active.svg');
    expect(screen.getByRole('button').querySelector('span')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalled();
  });
});
