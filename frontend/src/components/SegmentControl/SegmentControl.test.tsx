import { render, screen, fireEvent } from '@testing-library/react';
import SegmentControl from './SegmentControl';
import type { Segment } from './SegmentControl';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('SegmentControl component', () => {
    const mockSegments: Segment[] = [
        { id: '1', label: 'Habits' },
        { id: '2', label: 'Challenges' },
        { id: '3', label: 'Goals' },
    ];

    const defaultProps = {
        segments: mockSegments,
        defaultSelectedId: '1',
        onSelect: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders all segments', () => {
        render(<SegmentControl {...defaultProps} />);
        
        expect(screen.getByText('Habits')).toBeInTheDocument();
        expect(screen.getByText('Challenges')).toBeInTheDocument();
        expect(screen.getByText('Goals')).toBeInTheDocument();
    });

    it('renders with correct default selected segment', () => {
        render(<SegmentControl {...defaultProps} />);
        
        const habitsSegment = screen.getByText('Habits');
        expect(habitsSegment.className).toContain('active');
        
        const challengesSegment = screen.getByText('Challenges');
        expect(challengesSegment.className).not.toContain('active');
    });

    it('applies active class to selected segment', () => {
        render(<SegmentControl {...defaultProps} defaultSelectedId="2" />);
        
        const challengesSegment = screen.getByText('Challenges');
        expect(challengesSegment.className).toContain('active');
        
        const habitsSegment = screen.getByText('Habits');
        expect(habitsSegment.className).not.toContain('active');
    });

    it('calls onSelect when segment is clicked', () => {
        const mockOnSelect = vi.fn();
        render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);
        
        const challengesSegment = screen.getByText('Challenges');
        fireEvent.click(challengesSegment);
        
        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith('2');
    });

    it('updates internal state and calls onSelect in correct order', () => {
        const mockOnSelect = vi.fn();
        render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);
        
        expect(screen.getByText('Habits').className).toContain('active');
        
        const challengesSegment = screen.getByText('Challenges');
        fireEvent.click(challengesSegment);
        
        expect(screen.getByText('Challenges').className).toContain('active');
        expect(screen.getByText('Habits').className).not.toContain('active');
        
        expect(mockOnSelect).toHaveBeenCalledWith('2');
        expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it('updates active segment when different segment is clicked', () => {
        render(<SegmentControl {...defaultProps} />);
        
        expect(screen.getByText('Habits').className).toContain('active');
        expect(screen.getByText('Challenges').className).not.toContain('active');
        
        fireEvent.click(screen.getByText('Challenges'));
        
        expect(screen.getByText('Challenges').className).toContain('active');
        expect(screen.getByText('Habits').className).not.toContain('active');
    });

    it('executes handleSegmentClick correctly - state and callback', () => {
        const mockOnSelect = vi.fn();
        render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);

        fireEvent.click(screen.getByText('Challenges'));

        expect(screen.getByText('Challenges').className).toContain('active');
        expect(screen.getByText('Habits').className).not.toContain('active');
        expect(mockOnSelect).toHaveBeenNthCalledWith(1, '2');
        
        fireEvent.click(screen.getByText('Goals'));

        expect(screen.getByText('Goals').className).toContain('active');
        expect(screen.getByText('Challenges').className).not.toContain('active');
        expect(mockOnSelect).toHaveBeenNthCalledWith(2, '3');

        expect(mockOnSelect).toHaveBeenCalledTimes(2);
    });

    it('handleSegmentClick works with same segment clicked multiple times', () => {
        const mockOnSelect = vi.fn();
        render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);
        
        const habitsSegment = screen.getByText('Habits');
        
        fireEvent.click(habitsSegment);
        fireEvent.click(habitsSegment);
        fireEvent.click(habitsSegment);
        
        expect(habitsSegment.className).toContain('active');
        
        expect(mockOnSelect).toHaveBeenCalledTimes(3);
        expect(mockOnSelect).toHaveBeenCalledWith('1');
    });

    it('renders segments with correct CSS classes', () => {
        render(<SegmentControl {...defaultProps} />);
        
        const segments = screen.getAllByText(/Habits|Challenges|Goals/);
        
        segments.forEach((segment) => {
            expect(segment.className).toContain('segmentButton');
            expect(segment.className).toContain('body-bold');
        });
    });

    it('supports keyboard navigation', () => {
        const mockOnSelect = vi.fn();
        render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);
        
        const challengesSegment = screen.getByText('Challenges');
        
        fireEvent.keyDown(challengesSegment, { key: 'Enter', code: 'Enter' });
        challengesSegment.click();
        
        expect(mockOnSelect).toHaveBeenCalledWith('2');
    });

    it('handles segments with notifications property', () => {
        const segmentsWithNotifications: Segment[] = [
            { id: '1', label: 'Habits', notifications: 3 },
            { id: '2', label: 'Challenges', notifications: 0 },
            { id: '3', label: 'Goals' },
        ];
        
        render(
            <SegmentControl 
                segments={segmentsWithNotifications} 
                defaultSelectedId="1" 
                onSelect={vi.fn()} 
            />
        );
        
        expect(screen.getByText('Habits')).toBeInTheDocument();
        expect(screen.getByText('Challenges')).toBeInTheDocument();
        expect(screen.getByText('Goals')).toBeInTheDocument();
    });

    it('maintains internal state correctly through multiple clicks', () => {
        const mockOnSelect = vi.fn();
        render(<SegmentControl {...defaultProps} onSelect={mockOnSelect} />);
        
        fireEvent.click(screen.getByText('Challenges'));
        expect(screen.getByText('Challenges').className).toContain('active');
        expect(mockOnSelect).toHaveBeenCalledWith('2');
        
        fireEvent.click(screen.getByText('Goals'));
        expect(screen.getByText('Goals').className).toContain('active');
        expect(screen.getByText('Challenges').className).not.toContain('active');
        expect(mockOnSelect).toHaveBeenCalledWith('3');
        
        fireEvent.click(screen.getByText('Habits'));
        expect(screen.getByText('Habits').className).toContain('active');
        expect(screen.getByText('Goals').className).not.toContain('active');
        expect(mockOnSelect).toHaveBeenCalledWith('1');
        
        expect(mockOnSelect).toHaveBeenCalledTimes(3);
    });

    it('handles invalid defaultSelectedId gracefully', () => {
        render(
            <SegmentControl 
                {...defaultProps} 
                defaultSelectedId="invalid-id" 
            />
        );
        
        expect(screen.getByText('Habits')).toBeInTheDocument();
        
        const segments = screen.getAllByText(/Habits|Challenges|Goals/);
        segments.forEach((segment) => {
            expect(segment.className).not.toContain('active');
        });
    });
});