import { render, screen } from '@testing-library/react';
import AppBarDecktop from '@components/layout/AppBarDecktop';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMediaQuery } from 'react-responsive';

vi.mock('react-responsive');

vi.mock('@assets/images/icons/plus.svg', () => ({
  default: 'plus.svg',
}));
vi.mock('@assets/images/icons/home.svg', () => ({
  default: 'home.svg',
}));
vi.mock('@assets/images/icons/explore.svg', () => ({
  default: 'explore.svg',
}));
vi.mock('@assets/images/icons/activity.svg', () => ({
  default: 'activity.svg',
}));
vi.mock('@assets/images/icons/profile.svg', () => ({
  default: 'profile.svg',
}));

const mockUseMediaQuery = vi.mocked(useMediaQuery);

describe('AppBarDecktop component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when screen is mobile size', () => {
    mockUseMediaQuery.mockReturnValue(false);
    
    const { container } = render(<AppBarDecktop />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders all navigation buttons', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarDecktop />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('renders outline buttons for navigation items', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarDecktop />);
    
    const buttons = screen.getAllByRole('button');
    const outlineButtons = buttons.filter(button => 
      button.className.includes('outline')
    );
    expect(outlineButtons).toHaveLength(4);
  });
});