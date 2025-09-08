import { render, screen } from '@testing-library/react';
import ProgressBanner from './ProgressBanner';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@components/CircleLoader/CircleLoader', () => ({
  default: (props: any) => (
    <div 
      data-testid="circle-loader" 
      data-percentages={props.percentages} 
      data-iswhite={props.isWhite}
    >
      Progress: {props.percentages}%
    </div>
  ),
}));

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: any) => (
    <span 
      data-testid="emoji" 
      data-name={props.name}
      className={props.className}
    >
      🔥
    </span>
  ),
}));

describe('ProgressBanner component', () => {
  it('renders the banner with all content', () => {
    render(<ProgressBanner />);
    
    expect(screen.getByText('Your daily goals almost done!')).toBeInTheDocument();
    expect(screen.getByText('1 of 4 completed')).toBeInTheDocument();
  });

  it('renders CircleLoader with correct props', () => {
    render(<ProgressBanner />);
    
    const circleLoader = screen.getByTestId('circle-loader');
    expect(circleLoader).toBeInTheDocument();
    expect(circleLoader).toHaveAttribute('data-percentages', '56');
    expect(circleLoader).toHaveAttribute('data-iswhite', 'true');
  });

  it('renders fire emoji with correct props', () => {
    render(<ProgressBanner />);
    
    const emoji = screen.getByTestId('emoji');
    expect(emoji).toBeInTheDocument();
    expect(emoji).toHaveAttribute('data-name', 'fire');
    expect(emoji.className).toContain('emoji');
  });

  it('applies correct CSS classes to main text', () => {
    render(<ProgressBanner />);
    
    const mainText = screen.getByText('Your daily goals almost done!');
    expect(mainText.className).toContain('body-bold');
    expect(mainText.className).toContain('mainText');
  });

  it('applies correct CSS classes to secondary text', () => {
    render(<ProgressBanner />);
    
    const secondaryText = screen.getByText('1 of 4 completed');
    expect(secondaryText.className).toContain('alternative');
    expect(secondaryText.className).toContain('secondaryText');
  });

  it('renders main text with emoji inline', () => {
    render(<ProgressBanner />);
    
    const mainText = screen.getByText('Your daily goals almost done!');
    const emoji = screen.getByTestId('emoji');
    
    expect(mainText.parentElement).toContain(emoji);
  });

  it('displays correct progress information', () => {
    render(<ProgressBanner />);
    
    expect(screen.getByText('Progress: 56%')).toBeInTheDocument();
    
    expect(screen.getByText('1 of 4 completed')).toBeInTheDocument();
  });

  it('renders as a complete banner component', () => {
    render(<ProgressBanner />);
    
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
    expect(screen.getByText('Your daily goals almost done!')).toBeInTheDocument();
    expect(screen.getByTestId('emoji')).toBeInTheDocument();
    expect(screen.getByText('1 of 4 completed')).toBeInTheDocument();
  });

  it('emoji has correct CSS class for styling', () => {
    render(<ProgressBanner />);
    
    const emoji = screen.getByTestId('emoji');
    expect(emoji.className).toContain('emoji');
  });

});