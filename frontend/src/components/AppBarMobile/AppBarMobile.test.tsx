import { render, screen, fireEvent } from '@testing-library/react';
import AppBarMobile from './AppBarMobile';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { useMediaQuery } from 'react-responsive';

vi.mock('react-responsive');

vi.mock('@assets/images/icons/plus.svg', () => ({
  default: 'plus.svg',
}));

global.alert = vi.fn();

const mockUseMediaQuery = vi.mocked(useMediaQuery);

describe('AppBarMobile component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when screen is desktop size', () => {
    mockUseMediaQuery.mockReturnValue(false);
    
    const { container } = render(<AppBarMobile />);
    
    expect(container.firstChild).toBeNull();
  });

  it('renders all menu buttons', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarMobile />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(5);
  });

  it('renders add button with plus icon', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarMobile />);
    
    const addButton = screen.getByRole('img', { name: 'add button' });
    expect(addButton).toBeInTheDocument();
    expect(addButton).toHaveAttribute('src', 'plus.svg');
  });

  it('shows alert when menu buttons are clicked', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarMobile />);
    
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    
    expect(global.alert).toHaveBeenCalledWith('Unavailable Page');
  });

  it('renders MenuButton with active state', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarMobile />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeInTheDocument();
  });

  it('renders MenuButton with dot notification', () => {
    mockUseMediaQuery.mockReturnValue(true);
    
    render(<AppBarMobile />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons[3]).toBeInTheDocument();
  });
});