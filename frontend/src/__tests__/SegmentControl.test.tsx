import { render, screen, fireEvent } from '@testing-library/react';
import SegmentControl from '@components/ui/SegmentControl';
import type { Segment } from '@components/ui/SegmentControl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockSegments: Segment[] = [
  { id: '1', label: 'Habits' },
  { id: '2', label: 'Challenges' },
  { id: '3', label: 'Goals' },
];

describe('SegmentControl component', () => {
  const defaultProps = {
    segments: mockSegments,
    defaultSelectedId: '1',
    onSelect: vi.fn(),
  };

  beforeEach(() => { vi.clearAllMocks(); });

  it('renders all segments', () => {
    render(<SegmentControl {...defaultProps} />);
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    expect(screen.getByText('Goals')).toBeInTheDocument();
  });

  it('highlights the default selected segment with blue text', () => {
    render(<SegmentControl {...defaultProps} />);
    expect(screen.getByText('Habits').className).toContain('text-accent');
    expect(screen.getByText('Challenges').className).not.toContain('text-accent');
  });

  it('switches active segment on click', () => {
    render(<SegmentControl {...defaultProps} />);
    fireEvent.click(screen.getByText('Challenges'));
    expect(screen.getByText('Challenges').className).toContain('text-accent');
    expect(screen.getByText('Habits').className).not.toContain('text-accent');
  });

  it('calls onSelect with correct id when segment is clicked', () => {
    const mockOnSelect = vi.fn();
    render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);
    fireEvent.click(screen.getByText('Challenges'));
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith('2');
  });

  it('all segments have body-bold typography class', () => {
    render(<SegmentControl {...defaultProps} />);
    screen.getAllByText(/Habits|Challenges|Goals/).forEach(seg => {
      expect(seg.className).toContain('body-bold');
    });
  });

  it('handles multiple sequential clicks correctly', () => {
    const mockOnSelect = vi.fn();
    render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('Challenges'));
    expect(screen.getByText('Challenges').className).toContain('text-accent');
    expect(mockOnSelect).toHaveBeenCalledWith('2');

    fireEvent.click(screen.getByText('Goals'));
    expect(screen.getByText('Goals').className).toContain('text-accent');
    expect(screen.getByText('Challenges').className).not.toContain('text-accent');
    expect(mockOnSelect).toHaveBeenCalledWith('3');

    expect(mockOnSelect).toHaveBeenCalledTimes(2);
  });

  it('clicking same segment multiple times keeps it active', () => {
    const mockOnSelect = vi.fn();
    render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);

    fireEvent.click(screen.getByText('Habits'));
    fireEvent.click(screen.getByText('Habits'));
    fireEvent.click(screen.getByText('Habits'));

    expect(screen.getByText('Habits').className).toContain('text-accent');
    expect(mockOnSelect).toHaveBeenCalledTimes(3);
    expect(mockOnSelect).toHaveBeenCalledWith('1');
  });

  it('handles invalid defaultSelectedId gracefully', () => {
    render(<SegmentControl {...defaultProps} defaultSelectedId="invalid" />);
    screen.getAllByText(/Habits|Challenges|Goals/).forEach(seg => {
      expect(seg.className).not.toContain('text-accent');
    });
  });

  it('supports segments with notifications property', () => {
    const segsWithNotif: Segment[] = [
      { id: '1', label: 'Habits', notifications: 3 },
      { id: '2', label: 'Challenges' },
    ];
    render(<SegmentControl segments={segsWithNotif} defaultSelectedId="1" onSelect={vi.fn()} />);
    expect(screen.getByText('Habits')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
  });
});
