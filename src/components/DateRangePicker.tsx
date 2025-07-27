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
import { ar } from 'date-fns/locale';
import { useLanguage } from '../contexts/LanguageContext';

const PickerContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const PickerButton = styled.button<{ $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #141F25;
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    border-color: #D6B10E;
  }
  
  .icon {
    color: #666;
  }
`;

const DropdownContainer = styled.div<{ $isOpen: boolean; $isRTL?: boolean }>`
  position: absolute;
  top: 100%;
  right: ${props => props.$isRTL ? 'auto' : '0'};
  left: ${props => props.$isRTL ? '0' : 'auto'};
  z-index: 1000;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  padding: 16px;
  min-width: 280px;
  max-width: 300px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 8px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TabContainer = styled.div`
  display: flex;
  gap: 6px;
  margin-bottom: 16px;
`;

const Tab = styled.button<{ $isActive: boolean; $isRTL?: boolean }>`
  padding: 8px 16px;
  background: ${props => props.$isActive ? '#D6B10E' : 'transparent'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: none;
  border-radius: 6px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
  }
`;

const CalendarContainer = styled.div`
  margin-bottom: 16px;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`;

const MonthYear = styled.h3<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
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

const DayHeader = styled.div<{ $isRTL?: boolean }>`
  text-align: center;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
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
  display: flex;
  align-items: center;
  justify-content: center;
  
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

const RangeDisplay = styled.div<{ $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #F3F1E4;
  border: 1px solid #D6B10E;
  border-radius: 8px;
  margin-bottom: 16px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #666;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const DoneButton = styled.button<{ $isRTL?: boolean }>`
  width: auto;
  min-width: 100px;
  padding: 10px 24px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: #c4a00d;
  }
`;

const DoneButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 12px;
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
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = isRTL ? ar : undefined;
  
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
        week: t('common.thisWeek'),
        month: t('common.thisMonth'),
        custom: t('common.custom')
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
    const dayHeaders = t('datePicker.dayHeaders') as string[];
    
    return (
      <CalendarGrid>
        {dayHeaders.map((day, index) => (
          <DayHeader key={index} $isRTL={isRTL}>{day}</DayHeader>
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
      return `${format(selectedStart, 'd MMM', { locale })} - ${format(selectedEnd, 'd MMM', { locale })}`;
    } else if (selectedStart) {
      return `${format(selectedStart, 'd MMM', { locale })} - ${t('datePicker.selectEndDate')}`;
    }
    return t('datePicker.selectDateRange');
  };

  return (
    <PickerContainer ref={containerRef}>
      <PickerButton $isRTL={isRTL} onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">📅</span>
        {value.label === t('common.custom') ? 
          `${format(value.startDate, 'd MMM yyyy', { locale })} - ${format(value.endDate, 'd MMM yyyy', { locale })}` :
          value.label
        }
      </PickerButton>
      
      <DropdownContainer $isOpen={isOpen} $isRTL={isRTL}>
        <TabContainer>
          <Tab 
            $isActive={activeTab === 'week'} 
            $isRTL={isRTL}
            onClick={() => handleTabChange('week')}
          >
            {t('common.thisWeek')}
          </Tab>
          <Tab 
            $isActive={activeTab === 'month'} 
            $isRTL={isRTL}
            onClick={() => handleTabChange('month')}
          >
            {t('common.thisMonth')}
          </Tab>
          <Tab 
            $isActive={activeTab === 'custom'} 
            $isRTL={isRTL}
            onClick={() => handleTabChange('custom')}
          >
            {t('common.custom')}
          </Tab>
        </TabContainer>

        <CalendarContainer>
          <CalendarHeader>
            <NavButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              {isRTL ? '›' : '‹'}
            </NavButton>
            <MonthYear $isRTL={isRTL}>{format(currentMonth, 'MMMM yyyy', { locale })}</MonthYear>
            <NavButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              {isRTL ? '‹' : '›'}
            </NavButton>
          </CalendarHeader>
          {renderCalendar()}
        </CalendarContainer>

        {(selectedStart || selectedEnd) && (
          <RangeDisplay $isRTL={isRTL}>
            <span>{formatDateRange()}</span>
            <span>{isRTL ? '‹' : '›'}</span>
          </RangeDisplay>
        )}

        <DoneButtonContainer>
          <DoneButton $isRTL={isRTL} onClick={handleDone}>
            {t('common.done')}
          </DoneButton>
        </DoneButtonContainer>
      </DropdownContainer>
    </PickerContainer>
  );
};

export default DateRangePicker; 