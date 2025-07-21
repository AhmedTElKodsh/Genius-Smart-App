import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  startOfDay,
  endOfDay,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  isToday,
  isFuture
} from 'date-fns';

const PickerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PickerButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #141F25;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #D6B10E;
  }
  
  .icon {
    color: #666;
  }
`;

const DropdownContainer = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 20px;
  min-width: 320px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 8px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
`;

const Tab = styled.button<{ $isActive: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: none;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
  }
`;

const CalendarContainer = styled.div`
  margin-bottom: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthYear = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
`;

const NavButton = styled.button`
  width: 32px;
  height: 32px;
  background: #D6B10E;
  border: none;
  border-radius: 50%;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c4a00d;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayHeader = styled.div`
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #666;
  padding: 8px;
`;

const DayCell = styled.button<{ 
  $isSelected: boolean; 
  $isInRange: boolean; 
  $isToday: boolean; 
  $isOtherMonth: boolean;
  $isFuture: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  cursor: ${props => props.$isFuture || props.$isOtherMonth ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  
  background: ${props => {
    if (props.$isSelected) return '#D6B10E';
    if (props.$isInRange) return '#FFF3CD';
    if (props.$isToday) return '#E7E7E7';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.$isFuture || props.$isOtherMonth) return '#ccc';
    if (props.$isSelected) return '#ffffff';
    if (props.$isToday) return '#141F25';
    return '#141F25';
  }};
  
  &:hover {
    background: ${props => {
      if (props.$isFuture || props.$isOtherMonth) return 'transparent';
      if (props.$isSelected) return '#D6B10E';
      return '#f5f5f5';
    }};
  }
`;

const RangeDisplay = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F3F1E4;
  border: 1px solid #D6B10E;
  border-radius: 8px;
  margin-bottom: 16px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
`;

const DoneButton = styled.button`
  width: 100%;
  padding: 12px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c4a00d;
  }
`;

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'custom'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThisWeekRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 6); // 7 days before (including today = 7 days total)
    const end = now;
    
    return {
      start: startOfDay(start),
      end: endOfDay(end)
    };
  };

  const getThisMonthRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = now; // Up to today, not end of month
    
    return {
      start: startOfDay(start),
      end: endOfDay(end)
    };
  };

  const handleTabChange = (tab: 'week' | 'month' | 'custom') => {
    setActiveTab(tab);
    
    if (tab === 'week') {
      const range = getThisWeekRange();
      setSelectedStart(range.start);
      setSelectedEnd(range.end);
    } else if (tab === 'month') {
      const range = getThisMonthRange();
      setSelectedStart(range.start);
      setSelectedEnd(range.end);
    } else {
      // Custom - reset selection
      setSelectedStart(null);
      setSelectedEnd(null);
    }
  };

  const handleDayClick = (day: Date) => {
    if (isFuture(day) || !isSameMonth(day, currentMonth)) {
      return;
    }

    // Allow manual date selection on all tabs
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Start new selection
      setSelectedStart(day);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      // Set end date
      if (isBefore(day, selectedStart)) {
        // If selected day is before start, swap them
        setSelectedEnd(selectedStart);
        setSelectedStart(day);
      } else {
        setSelectedEnd(day);
      }
    }
  };

  const handleDone = () => {
    if (selectedStart && selectedEnd) {
      const labels = {
        week: 'This Week',
        month: 'This Month',
        custom: 'Custom'
      };
      
      const range: DateRange = {
        startDate: selectedStart,
        endDate: selectedEnd,
        label: labels[activeTab]
      };
      onChange(range);
    }
    setIsOpen(false);
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    
    return (
      <CalendarGrid>
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
          <DayHeader key={day}>{day}</DayHeader>
        ))}
        {days.map(day => {
          const isSelected = selectedStart && selectedEnd && 
            (isSameDay(day, selectedStart) || isSameDay(day, selectedEnd));
          const isInRange = selectedStart && selectedEnd &&
            isAfter(day, selectedStart) && isBefore(day, selectedEnd);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const isDayFuture = isFuture(day);
          
          return (
            <DayCell
              key={day.toISOString()}
              $isSelected={!!isSelected}
              $isInRange={!!isInRange}
              $isToday={isDayToday}
              $isOtherMonth={!isCurrentMonth}
              $isFuture={isDayFuture}
              onClick={() => handleDayClick(day)}
              disabled={isDayFuture || !isCurrentMonth}
            >
              {format(day, 'd')}
            </DayCell>
          );
        })}
      </CalendarGrid>
    );
  };

  const formatDateRange = () => {
    if (selectedStart && selectedEnd) {
      return `${format(selectedStart, 'd MMM')} - ${format(selectedEnd, 'd MMM')}`;
    } else if (selectedStart) {
      return `${format(selectedStart, 'd MMM')} - Select end date`;
    }
    return 'Select date range';
  };

  return (
    <PickerContainer ref={containerRef}>
      <PickerButton onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">📅</span>
        {value.label === 'Custom' ? 
          `${format(value.startDate, 'd MMM yyyy')} - ${format(value.endDate, 'd MMM yyyy')}` :
          value.label
        }
      </PickerButton>
      
      <DropdownContainer $isOpen={isOpen}>
        <TabContainer>
          <Tab 
            $isActive={activeTab === 'week'} 
            onClick={() => handleTabChange('week')}
          >
            This week
          </Tab>
          <Tab 
            $isActive={activeTab === 'month'} 
            onClick={() => handleTabChange('month')}
          >
            This Month
          </Tab>
          <Tab 
            $isActive={activeTab === 'custom'} 
            onClick={() => handleTabChange('custom')}
          >
            Custom
          </Tab>
        </TabContainer>

        <CalendarContainer>
          <CalendarHeader>
            <NavButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              ‹
            </NavButton>
            <MonthYear>{format(currentMonth, 'MMMM yyyy')}</MonthYear>
            <NavButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              ›
            </NavButton>
          </CalendarHeader>
          {renderCalendar()}
        </CalendarContainer>

        {(selectedStart || selectedEnd) && (
          <RangeDisplay>
            <span>{formatDateRange()}</span>
            <span>›</span>
          </RangeDisplay>
        )}

        <DoneButton onClick={handleDone}>
          Done
        </DoneButton>
      </DropdownContainer>
    </PickerContainer>
  );
};

export default DateRangePicker; 