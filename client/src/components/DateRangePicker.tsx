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
import { translations } from '../utils/translations';

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
  min-width: 160px;
  
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
  padding: 20px;
  min-width: 340px;
  max-width: 380px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 8px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const QuickOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
`;



const QuickOption = styled.button<{ $isActive: boolean; $isRTL?: boolean }>`
  padding: 12px 16px;
  background: ${props => props.$isActive ? '#D6B10E' : '#ffffff'};
  color: ${props => props.$isActive ? '#ffffff' : '#666'};
  border: 1px solid ${props => props.$isActive ? '#D6B10E' : '#e1e7ec'};
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
  &:hover {
    background: ${props => props.$isActive ? '#D6B10E' : '#f5f5f5'};
    border-color: #D6B10E;
  }
`;

const CalendarContainer = styled.div`
  padding: 4px 0;
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
  font-weight: 600;
  color: #666;
  padding: 8px;
`;

const DayCell = styled.button<{ 
  $isSelected: boolean; 
  $isInRange: boolean; 
  $isToday: boolean; 
  $isOtherMonth: boolean;
  $isFuture: boolean;
  $isWeekend: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: ${props => props.$isSelected ? '600' : '400'};
  cursor: ${props => props.$isFuture || props.$isOtherMonth ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: ${props => {
    if (props.$isSelected) return '#D6B10E';
    if (props.$isInRange) return '#FFF3CD';
    if (props.$isToday) return '#E7E7E7';
    if (props.$isWeekend && !props.$isOtherMonth) return '#F5F5F5';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.$isFuture || props.$isOtherMonth) return '#ccc';
    if (props.$isSelected) return '#ffffff';
    if (props.$isWeekend && !props.$isSelected && !props.$isOtherMonth) return '#999999';
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
  justify-content: center;
  padding: 12px 16px;
  background: #F3F1E4;
  border: 1px solid #D6B10E;
  border-radius: 8px;
  margin-top: 16px;
  margin-bottom: 16px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #666;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: center;
`;

const DoneButton = styled.button<{ $isRTL?: boolean }>`
  width: 100%;
  padding: 12px 24px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  
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
  value: [Date, Date];
  onChange: (range: [Date, Date]) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = isRTL ? ar : undefined;
  
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<'today' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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

  // Helper function to get date range based on selected option
  const getDateRangeForOption = (option: 'today' | 'week' | 'month') => {
    const now = new Date();
    switch (option) {
      case 'today':
        return { start: startOfDay(now), end: endOfDay(now) };
      case 'week':
        return { start: startOfWeek(now), end: endOfWeek(now) };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      default:
        return { start: startOfMonth(now), end: endOfMonth(now) };
    }
  };

  // Get current range to display
  const getCurrentRange = () => {
    if (selectedStart && selectedEnd) {
      return { start: selectedStart, end: selectedEnd };
    }
    return getDateRangeForOption(selectedOption);
  };

  const handlePresetOption = (option: 'today' | 'week' | 'month' | 'quarter' | 'year') => {
    setSelectedOption(option);
    const range = getDateRangeForOption(option);
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
  };

  const handleDateClick = (date: Date) => {
    if (isFuture(date)) return;
    
    if (!selectedStart || (selectedStart && selectedEnd)) {
      setSelectedStart(date);
      setSelectedEnd(null);
    } else if (selectedStart && !selectedEnd) {
      if (isAfter(date, selectedStart)) {
        setSelectedEnd(date);
      } else {
        setSelectedStart(date);
        setSelectedEnd(null);
      }
    }
    // Don't switch to custom mode since we removed it
  };

  const handleDone = () => {
    const currentRange = getCurrentRange();
    onChange([currentRange.start, currentRange.end]);
    setIsOpen(false);
  };

  // Initialize with current month range
  useEffect(() => {
    const range = getDateRangeForOption('month');
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
  }, []);

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    // Use translated day headers from translations
    const dayHeaders = translations[language]?.dayHeaders || ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
      <CalendarGrid>
        {dayHeaders.map((day, index) => (
          <DayHeader key={index} $isRTL={isRTL}>{day}</DayHeader>
        ))}
        {days.map(day => {
          const isSelected = selectedStart && selectedEnd && 
            (isSameDay(day, selectedStart) || isSameDay(day, selectedEnd));
          // Show selection if it's the only start date selected or part of complete range
          const isStartOnly = selectedStart && !selectedEnd && isSameDay(day, selectedStart);
          const isInRange = selectedStart && selectedEnd &&
            isAfter(day, selectedStart) && isBefore(day, selectedEnd);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isDayToday = isToday(day);
          const isDayFuture = isFuture(day);
          const isEgyptianWeekend = day.getDay() === 5 || day.getDay() === 6; // Friday (5) or Saturday (6)
          
          return (
            <DayCell
              key={day.toISOString()}
              $isSelected={!!isSelected || !!isStartOnly}
              $isInRange={!!isInRange}
              $isToday={isDayToday}
              $isOtherMonth={!isCurrentMonth}
              $isFuture={isDayFuture}
              $isWeekend={isEgyptianWeekend}
              onClick={() => handleDateClick(day)}
              disabled={isDayFuture || !isCurrentMonth}
            >
              {format(day, 'd')}
            </DayCell>
          );
        })}
      </CalendarGrid>
    );
  };

  // Function to get the current display label based on the date range
  const getCurrentDisplayLabel = () => {
    const todayRange = getDateRangeForOption('today');
    const weekRange = getDateRangeForOption('week');
    const monthRange = getDateRangeForOption('month');
    
    if (isSameDay(value[0], todayRange.start) && isSameDay(value[1], todayRange.end)) {
      return t('common.today');
    } else if (isSameDay(value[0], weekRange.start) && isSameDay(value[1], weekRange.end)) {
      return t('common.thisWeek');
    } else if (isSameDay(value[0], monthRange.start) && isSameDay(value[1], monthRange.end)) {
      return t('common.thisMonth');
    } else {
      return `${format(value[0], 'd MMM yyyy', { locale })} - ${format(value[1], 'd MMM yyyy', { locale })}`;
    }
  };

  return (
    <PickerContainer ref={containerRef}>
      <PickerButton $isRTL={isRTL} onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">📅</span>
        {getCurrentDisplayLabel()}
      </PickerButton>
      
      <DropdownContainer $isOpen={isOpen} $isRTL={isRTL}>
        <QuickOptionsContainer>
          {/* Single row: Today, This Week, This Month */}
          <QuickOption 
            $isActive={selectedOption === 'today'} 
            $isRTL={isRTL}
            onClick={() => handlePresetOption('today')}
          >
            {t('common.today')}
          </QuickOption>
          <QuickOption 
            $isActive={selectedOption === 'week'} 
            $isRTL={isRTL}
            onClick={() => handlePresetOption('week')}
          >
            {t('common.thisWeek')}
          </QuickOption>
          <QuickOption 
            $isActive={selectedOption === 'month'} 
            $isRTL={isRTL}
            onClick={() => handlePresetOption('month')}
          >
            {t('common.thisMonth')}
          </QuickOption>
        </QuickOptionsContainer>

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
          
          {/* Always show the actual date range, even for presets */}
          <RangeDisplay $isRTL={isRTL}>
            {(() => {
              const currentRange = getCurrentRange();
              if (currentRange.start && currentRange.end) {
                // Always show actual dates for complete range
                return `${format(currentRange.start, 'd MMM, yyyy', { locale })} - ${format(currentRange.end, 'd MMM, yyyy', { locale })}`;
              } else if (selectedStart && !selectedEnd) {
                // Show incomplete range when only start date is selected
                return `${format(selectedStart, 'd MMM', { locale })} - `;
              }
              return t('datePicker.selectDateRange');
            })()}
          </RangeDisplay>
          
          <DoneButton $isRTL={isRTL} onClick={handleDone}>
            {t('common.done')}
          </DoneButton>
        </CalendarContainer>
      </DropdownContainer>
    </PickerContainer>
  );
};

export default DateRangePicker; 