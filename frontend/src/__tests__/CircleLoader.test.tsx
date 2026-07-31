import { render, screen } from '@testing-library/react';
import type { ComponentProps } from 'react';
import CircleLoader from '@components/habit/CircleLoader';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-apple-emojis', () => ({
  Emoji: (props: ComponentProps<'span'>) => <span data-testid="emoji" {...props} />,
}));

vi.mock('@assets/images/icons/tick.svg', () => ({
  default: 'tick.svg',
}));

describe('CircleLoader component', () => {
  it('renders with basic percentage display', () => {
    render(<CircleLoader percentages={50} />);

    expect(screen.getByText('%50')).toBeInTheDocument();
  });

  it('renders emoji when emoji prop is provided', () => {
    render(<CircleLoader percentages={75} emoji="droplet" />);

    const emoji = screen.getByTestId('emoji');
    expect(emoji).toBeInTheDocument();
    expect(emoji).toHaveAttribute('name', 'droplet');
  });

  it('renders tick icon when percentages is 100 and no emoji', () => {
    render(<CircleLoader percentages={100} />);

    const tickIcon = screen.getByRole('img', { name: 'done' });
    expect(tickIcon).toBeInTheDocument();
    expect(tickIcon).toHaveAttribute('src', 'tick.svg');
  });

  it('does not apply white styles when isWhite prop is false', () => {
    const { container } = render(<CircleLoader percentages={60} isWhite={false} />);

    expect(container.firstChild).not.toHaveClass('isWhite');
  });

  it('prioritizes emoji over tick icon when both could be shown', () => {
    render(<CircleLoader percentages={100} emoji="fire" />);

    const emoji = screen.getByTestId('emoji');
    expect(emoji).toBeInTheDocument();

    const tickIcon = screen.queryByRole('img', { name: 'tick' });
    expect(tickIcon).not.toBeInTheDocument();
  });

  it('shows percentage text when not 100% and no emoji', () => {
    render(<CircleLoader percentages={37} />);

    expect(screen.getByText('%37')).toBeInTheDocument();
    expect(screen.queryByTestId('emoji')).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: 'done' })).not.toBeInTheDocument();
  });

  it('handles edge case percentages correctly', () => {
    const { rerender } = render(<CircleLoader percentages={0} />);
    expect(screen.getByText('%0')).toBeInTheDocument();

    rerender(<CircleLoader percentages={100} />);
    expect(screen.getByRole('img', { name: 'done' })).toBeInTheDocument();

    rerender(<CircleLoader percentages={1} />);
    expect(screen.getByText('%1')).toBeInTheDocument();

    rerender(<CircleLoader percentages={99} />);
    expect(screen.getByText('%99')).toBeInTheDocument();
  });
});