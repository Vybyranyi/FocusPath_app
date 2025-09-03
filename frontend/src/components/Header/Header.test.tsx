import { render, screen } from '@testing-library/react';
import Header from './Header';
import { describe, expect, it, vi } from 'vitest';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: any) => <span data-testid="emoji" {...props} />,
}));

vi.mock('@assets/images/default_user.png', () => ({
  default: 'default_user.png',
}));
vi.mock('@assets/images/icons/medal_gold.svg', () => ({
  default: 'medal_gold.svg',
}));

const mockStore = configureStore({
  reducer: {
    auth: () => ({
      user: {
        _id: '1',
        name: 'John',
        surname: 'Doe',
        email: 'john@example.com'
      }
    })
  }
});

const renderWithStore = (component: React.ReactElement) => {
  return render(
    <Provider store={mockStore}>
      {component}
    </Provider>
  );
};

describe('Header component', () => {
  it('renders header element', () => {
    renderWithStore(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('renders title when title prop is provided', () => {
    const leftButton = <button>Left</button>;
    const rightButton = <button>Right</button>;
    
    renderWithStore(
      <Header 
        title="Test Title" 
        leftButtonIcon={leftButton}
        rightButtonIcon={rightButton}
      />
    );
    
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('renders left and right button icons when provided', () => {
    const leftButton = <button>Left Button</button>;
    const rightButton = <button>Right Button</button>;
    
    renderWithStore(
      <Header 
        title="Test" 
        leftButtonIcon={leftButton}
        rightButtonIcon={rightButton}
      />
    );
    
    expect(screen.getByText('Left Button')).toBeInTheDocument();
    expect(screen.getByText('Right Button')).toBeInTheDocument();
  });

  it('renders top content when topContent prop is true', () => {
    renderWithStore(<Header topContent />);
    
    expect(screen.getByText('Hi, John')).toBeInTheDocument();
    expect(screen.getByText("Let’s make habits together!")).toBeInTheDocument();
    expect(screen.getAllByTestId('emoji')).toHaveLength(2);
  });

  it('renders profile section when profile prop is true', () => {
    renderWithStore(<Header profile />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('1452 Points')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'User profile photo' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'gold medal' })).toBeInTheDocument();
  });

  it('renders segment control when segmentControl prop is true', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    
    renderWithStore(<Header segmentControl />);
    
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    
    consoleSpy.mockRestore();
  });

  it('renders week selector when showWeekController prop is true', () => {
    renderWithStore(<Header showWeekController />);
    
    expect(screen.getByText('This week')).toBeInTheDocument();
  });

  it('does not render title block when no title props are provided', () => {
    renderWithStore(<Header />);
    
    const titleElements = screen.queryByRole('heading', { level: 5 });
    expect(titleElements).not.toBeInTheDocument();
  });

  it('does not render top content when topContent prop is false', () => {
    renderWithStore(<Header topContent={false} />);
    
    expect(screen.queryByText('Hi, John')).not.toBeInTheDocument();
  });

  it('does not render profile when profile prop is false', () => {
    renderWithStore(<Header profile={false} />);
    
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes', () => {
    renderWithStore(<Header />);
    
    const header = screen.getByRole('banner');
    expect(header.className).toContain('header');
  });

  it('renders desktop buttons in profile section when buttons are provided', () => {
    const leftButton = <button>Settings</button>;
    const rightButton = <button>Menu</button>;
    
    renderWithStore(
      <Header 
        profile
        leftButtonIcon={leftButton}
        rightButtonIcon={rightButton}
      />
    );
    
    expect(screen.getAllByText('Settings'))
    expect(screen.getAllByText('Menu'))
  });
});