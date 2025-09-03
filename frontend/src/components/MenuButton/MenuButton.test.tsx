import { render, screen, fireEvent } from '@testing-library/react';
import MenuButton from './MenuButton';
import { describe, expect, it, vi } from 'vitest';

// Mock icon images
vi.mock('@assets/images/icons/home.svg', () => ({
  default: 'home.svg',
}));
vi.mock('@assets/images/icons/home_active.svg', () => ({
  default: 'home_active.svg',
}));
vi.mock('@assets/images/icons/explore.svg', () => ({
  default: 'explore.svg',
}));
vi.mock('@assets/images/icons/explore_active.svg', () => ({
  default: 'explore_active.svg',
}));
vi.mock('@assets/images/icons/activity.svg', () => ({
  default: 'activity.svg',
}));
vi.mock('@assets/images/icons/activity_active.svg', () => ({
  default: 'activity_active.svg',
}));
vi.mock('@assets/images/icons/profile.svg', () => ({
  default: 'profile.svg',
}));
vi.mock('@assets/images/icons/profile_active.svg', () => ({
  default: 'profile_active.svg',
}));

describe('MenuButton component', () => {
  it('renders button with home icon', () => {
    render(<MenuButton icon="home" />);
    
    const button = screen.getByRole('button');
    const icon = screen.getByRole('img', { name: 'home' });
    
    expect(button).toBeInTheDocument();
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', 'home.svg');
  });

  it('renders active icon when active prop is true', () => {
    render(<MenuButton icon="home" active />);
    
    const icon = screen.getByRole('img', { name: 'home' });
    expect(icon).toHaveAttribute('src', 'home_active.svg');
  });

  it('renders default icon when active prop is false', () => {
    render(<MenuButton icon="home" active={false} />);
    
    const icon = screen.getByRole('img', { name: 'home' });
    expect(icon).toHaveAttribute('src', 'home.svg');
  });

  it('renders explore icon correctly', () => {
    render(<MenuButton icon="explore" />);
    
    const icon = screen.getByRole('img', { name: 'explore' });
    expect(icon).toHaveAttribute('src', 'explore.svg');
  });

  it('renders activity icon correctly', () => {
    render(<MenuButton icon="activity" />);
    
    const icon = screen.getByRole('img', { name: 'activity' });
    expect(icon).toHaveAttribute('src', 'activity.svg');
  });

  it('renders profile icon correctly', () => {
    render(<MenuButton icon="profile" />);
    
    const icon = screen.getByRole('img', { name: 'profile' });
    expect(icon).toHaveAttribute('src', 'profile.svg');
  });

  it('renders dot notification when dot prop is true', () => {
    render(<MenuButton icon="home" dot />);
    
    const dot = screen.getByText('', { selector: 'span' });
    expect(dot).toBeInTheDocument();
    expect(dot.className).toContain('dot');
  });

  it('does not render dot when dot prop is false', () => {
    render(<MenuButton icon="home" dot={false} />);
    
    const dot = screen.queryByText('', { selector: 'span' });
    expect(dot).not.toBeInTheDocument();
  });

  it('calls onClick when button is clicked', () => {
    const handleClick = vi.fn();
    render(<MenuButton icon="home" onClick={handleClick} />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies active class when active prop is true', () => {
    render(<MenuButton icon="home" active />);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('active');
  });

  it('does not apply active class when active prop is false', () => {
    render(<MenuButton icon="home" active={false} />);
    
    const button = screen.getByRole('button');
    expect(button.className).not.toContain('active');
  });

  it('has correct CSS classes applied', () => {
    render(<MenuButton icon="home" />);
    
    const button = screen.getByRole('button');
    expect(button.className).toContain('menuButton');
  });

  it('works with combination of props', () => {
    const handleClick = vi.fn();
    render(
      <MenuButton 
        icon="activity" 
        active 
        dot 
        onClick={handleClick} 
      />
    );
    
    const button = screen.getByRole('button');
    const icon = screen.getByRole('img', { name: 'activity' });
    const dot = screen.getByText('', { selector: 'span' });
    
    expect(button).toBeInTheDocument();
    expect(button.className).toContain('active');
    expect(icon).toHaveAttribute('src', 'activity_active.svg');
    expect(dot).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});