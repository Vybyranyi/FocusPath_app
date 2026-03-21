import { render, screen } from '@testing-library/react';
import ProgressBanner from './ProgressBanner';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@components/CircleLoader/CircleLoader', () => ({
  default: (props: any) => (
    <div data-testid="circle-loader" data-percentages={props.percentages} data-iswhite={props.isWhite}>
      Progress: {props.percentages}%
    </div>
  ),
}));

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: any) => (
    <span data-testid="emoji" data-name={props.name} className={props.className}>🔥</span>
  ),
}));

describe('ProgressBanner component', () => {
  it('renders all banner content', () => {
    render(<ProgressBanner />);
    expect(screen.getByText('Your daily goals almost done!')).toBeInTheDocument();
    expect(screen.getByText('1 of 4 completed')).toBeInTheDocument();
    expect(screen.getByTestId('circle-loader')).toBeInTheDocument();
    expect(screen.getByTestId('emoji')).toBeInTheDocument();
  });

  it('passes correct props to CircleLoader', () => {
    render(<ProgressBanner />);
    const loader = screen.getByTestId('circle-loader');
    expect(loader).toHaveAttribute('data-percentages', '56');
    expect(loader).toHaveAttribute('data-iswhite', 'true');
  });

  it('renders fire emoji', () => {
    render(<ProgressBanner />);
    expect(screen.getByTestId('emoji')).toHaveAttribute('data-name', 'fire');
  });

  it('main text has body-bold class', () => {
    render(<ProgressBanner />);
    expect(screen.getByText('Your daily goals almost done!').className).toContain('body-bold');
  });

  it('secondary text has alternative class and blue color', () => {
    render(<ProgressBanner />);
    const secondary = screen.getByText('1 of 4 completed');
    expect(secondary.className).toContain('alternative');
    expect(secondary.className).toContain('text-primary-blue-40');
  });

  it('banner has blue gradient background', () => {
    const { container } = render(<ProgressBanner />);
    expect(container.firstChild).toHaveClass('bg-blue-gradient');
  });
});
