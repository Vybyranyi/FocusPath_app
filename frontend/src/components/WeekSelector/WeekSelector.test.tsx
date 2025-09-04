import { render, screen, fireEvent } from '@testing-library/react';
import WeekSelector from './WeekSelector';
import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('date-fns', () => ({
  format: vi.fn(() => 'Jan 1'),
  startOfWeek: vi.fn(() => new Date('2025-01-06')),
  endOfWeek: vi.fn(() => new Date('2025-01-12')),
  addWeeks: vi.fn((date, weeks) => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + weeks * 7);
    return newDate;
  }),
  differenceInCalendarWeeks: vi.fn(() => 0),
}));

vi.mock('@assets/images/icons/arrow-left.svg', () => ({
  default: 'arrow-left.svg',
}));
vi.mock('@assets/images/icons/arrow-right.svg', () => ({
  default: 'arrow-right.svg',
}));

import { format, startOfWeek, endOfWeek, addWeeks, differenceInCalendarWeeks } from 'date-fns';

const mockFormat = vi.mocked(format);
const mockStartOfWeek = vi.mocked(startOfWeek);
const mockEndOfWeek = vi.mocked(endOfWeek);
const mockAddWeeks = vi.mocked(addWeeks);
const mockDifferenceInCalendarWeeks = vi.mocked(differenceInCalendarWeeks);

describe('WeekSelector component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFormat.mockReturnValue('Jan 1');
    mockStartOfWeek.mockReturnValue(new Date('2025-01-06'));
    mockEndOfWeek.mockReturnValue(new Date('2025-01-12'));
    mockAddWeeks.mockImplementation((date, weeks) => {
      const newDate = new Date(date);
      newDate.setDate(newDate.getDate() + weeks * 7);
      return newDate;
    });
    mockDifferenceInCalendarWeeks.mockReturnValue(0);
  });

  it('renders week selector with default content', () => {
    render(<WeekSelector />);
    
    expect(screen.getByText('This week')).toBeInTheDocument();
    expect(screen.getByText('Jan 1 - Jan 1')).toBeInTheDocument();
  });

  it('renders left and right arrow buttons', () => {
    render(<WeekSelector />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(2);
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(2);
  });

  it('displays "Previous week" when diff is -1', () => {
    mockDifferenceInCalendarWeeks.mockReturnValue(-1);
    
    render(<WeekSelector />);
    
    expect(screen.getByText('Previous week')).toBeInTheDocument();
  });

  it('displays "Next week" when diff is 1', () => {
    mockDifferenceInCalendarWeeks.mockReturnValue(1);
    
    render(<WeekSelector />);
    
    expect(screen.getByText('Next week')).toBeInTheDocument();
  });

  it('displays weeks ago when diff is less than -1', () => {
    mockDifferenceInCalendarWeeks.mockReturnValue(-3);
    
    render(<WeekSelector />);
    
    expect(screen.getByText('3 weeks ago')).toBeInTheDocument();
  });

  it('displays weeks ahead when diff is greater than 1', () => {
    mockDifferenceInCalendarWeeks.mockReturnValue(2);
    
    render(<WeekSelector />);
    
    expect(screen.getByText('In 2 weeks')).toBeInTheDocument();
  });

  it('calls navigation functions when buttons are clicked', () => {
    render(<WeekSelector />);
    
    const buttons = screen.getAllByRole('button');
    const leftButton = buttons[0];
    const rightButton = buttons[1];
    
    fireEvent.click(leftButton);
    expect(mockAddWeeks).toHaveBeenCalledWith(expect.any(Date), -1);
    
    fireEvent.click(rightButton);
    expect(mockAddWeeks).toHaveBeenCalledWith(expect.any(Date), 1);
  });

  it('renders date range correctly', () => {
    mockFormat.mockReturnValue('Jan 15');
    
    render(<WeekSelector />);
    
    expect(screen.getByText('Jan 15 - Jan 15')).toBeInTheDocument();
    expect(mockFormat).toHaveBeenCalledWith(expect.any(Date), 'MMM d');
  });

  it('applies correct week start settings', () => {
    render(<WeekSelector />);
    
    expect(mockStartOfWeek).toHaveBeenCalledWith(expect.any(Date), { weekStartsOn: 1 });
    expect(mockEndOfWeek).toHaveBeenCalledWith(expect.any(Date), { weekStartsOn: 1 });
  });

  it('calculates week difference correctly', () => {
    render(<WeekSelector />);
    
    expect(mockDifferenceInCalendarWeeks).toHaveBeenCalledWith(
      expect.any(Date), 
      expect.any(Date), 
      { weekStartsOn: 1 }
    );
  });
});