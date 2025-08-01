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
  isFuture,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear
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
  z-index: 9999;
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 340px;
  max-width: 360px;
  display: ${props => props.$isOpen ? 'block' : 'none'};
  margin-top: 8px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TabContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
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
  $isWeekend: boolean;
  $isHoliday?: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  cursor: ${props => props.$isFuture || props.$isOtherMonth || props.$isWeekend || props.$isHoliday ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  background: ${props => {
    if (props.$isSelected) return '#D6B10E';
    if (props.$isInRange) return 'rgba(214, 177, 14, 0.15)'; // Light yellow for range
    if (props.$isToday && !props.$isWeekend && !props.$isHoliday) return '#E7E7E7';
    if (props.$isHoliday || props.$isWeekend) return '#F5F5F5'; // Gray for weekends and holidays
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.$isFuture || props.$isOtherMonth) return '#ccc';
    if (props.$isSelected) return '#ffffff';
    if (props.$isHoliday || props.$isWeekend) return '#999999'; // Gray text for weekends and holidays
    if (props.$isToday) return '#141F25';
    return '#141F25';
  }};
  
  opacity: ${props => (props.$isWeekend || props.$isHoliday) ? 0.6 : 1};
  
  &:hover {
    background: ${props => {
      if (props.$isFuture || props.$isOtherMonth || props.$isWeekend || props.$isHoliday) return props.$isWeekend || props.$isHoliday ? '#F5F5F5' : 'transparent';
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
  min-height: 45px;
  background: #ffffff;
  border: 2px solid #e1e7ec;
  border-radius: 8px;
  margin-bottom: 16px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #141F25;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: center;
  font-weight: 500;
  
  &:focus-within {
    border-color: #D6B10E;
  }
`;

const DoneButton = styled.button<{ $isRTL?: boolean }>`
  width: 100%;
  padding: 10px 24px;
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
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #c4a00d;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
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
  holidays?: Array<{ date: string; name?: string; nameAr?: string; }>;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ value, onChange, holidays = [] }) => {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = isRTL ? ar : undefined;
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'month' | null>(null);
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

  const getTodayRange = (): { start: Date; end: Date } => {
    const now = new Date();
    return {
      start: startOfDay(now),
      end: endOfDay(now)
    };
  };

  const getThisWeekRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = startOfWeek(now, { weekStartsOn: 0 }); // Start from Sunday
    const end = endOfWeek(now, { weekStartsOn: 0 });
    
    return {
      start: startOfDay(start),
      end: endOfDay(end)
    };
  };

  const getThisMonthRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);
    
    return {
      start: startOfDay(start),
      end: endOfDay(end)
    };
  };

  const getThisQuarterRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = startOfQuarter(now);
    const end = endOfQuarter(now);
    
    return {
      start: startOfDay(start),
      end: endOfDay(end)
    };
  };

  const getThisYearRange = (): { start: Date; end: Date } => {
    const now = new Date();
    const start = startOfYear(now);
    const end = endOfYear(now);
    
    return {
      start: startOfDay(start),
      end: endOfDay(end)
    };
  };

  const handleTabChange = (tab: 'today' | 'week' | 'month') => {
    setActiveTab(tab);
    
    let range: { start: Date; end: Date };
    
    switch(tab) {
      case 'today':
        range = getTodayRange();
        break;
      case 'week':
        range = getThisWeekRange();
        break;
      case 'month':
        range = getThisMonthRange();
        break;
    }
    
    setSelectedStart(range.start);
    setSelectedEnd(range.end);
  };

  const handleDayClick = (day: Date) => {
    if (isFuture(day) || !isSameMonth(day, currentMonth)) {
      return;
    }
    
    // Check if day is weekend or holiday
    const isEgyptianWeekend = day.getDay() === 5 || day.getDay() === 6;
    const dateString = format(day, 'yyyy-MM-dd');
    const isDayHoliday = holidays.some(holiday => holiday.date === dateString);
    
    if (isEgyptianWeekend || isDayHoliday) {
      return; // Don't allow selection of weekends or holidays
    }

    // Clear active tab when manually selecting dates
    setActiveTab(null);

    // Allow manual date selection
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
      // Determine the appropriate label based on actual date range
      let label: string;
      const locale = isRTL ? ar : undefined;
      
      // Check if it matches today
      const todayRange = getTodayRange();
      if (isSameDay(selectedStart, todayRange.start) && isSameDay(selectedEnd, todayRange.end)) {
        label = t('common.today');
      }
      // Check if it matches this week
      else {
        const thisWeekRange = getThisWeekRange();
        if (isSameDay(selectedStart, thisWeekRange.start) && isSameDay(selectedEnd, thisWeekRange.end)) {
          label = t('common.thisWeek');
        }
        // Check if it matches this month
        else {
          const thisMonthRange = getThisMonthRange();
          if (isSameDay(selectedStart, thisMonthRange.start) && isSameDay(selectedEnd, thisMonthRange.end)) {
            label = t('common.thisMonth');
          }
          // Check if it matches this quarter
          else {
            const thisQuarterRange = getThisQuarterRange();
            if (isSameDay(selectedStart, thisQuarterRange.start) && isSameDay(selectedEnd, thisQuarterRange.end)) {
              label = t('common.thisQuarter');
            }
            // Check if it matches this year
            else {
              const thisYearRange = getThisYearRange();
              if (isSameDay(selectedStart, thisYearRange.start) && isSameDay(selectedEnd, thisYearRange.end)) {
                label = t('common.thisYear');
              }
              // Otherwise it's custom - show the actual date range
              else {
                label = `${format(selectedStart, 'd MMMM, yyyy', { locale })} - ${format(selectedEnd, 'd MMMM, yyyy', { locale })}`;
              }
            }
          }
        }
      }
      
      const range: DateRange = {
        startDate: selectedStart,
        endDate: selectedEnd,
        label: label
      };
      onChange(range);
    } else if (selectedStart && !selectedEnd) {
      // Allow saving with just start date
      const locale = isRTL ? ar : undefined;
      const range: DateRange = {
        startDate: selectedStart,
        endDate: selectedStart, // Use same date for end
        label: format(selectedStart, 'd MMMM, yyyy', { locale })
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
    // Get day headers based on language
    const dayHeaders = isRTL 
      ? ['س', 'ج', 'خ', 'ر', 'ث', 'إ', 'أ'] // Arabic: Sat to Sun
      : ['S', 'M', 'T', 'W', 'T', 'F', 'S']; // English: Sun to Sat
    
    // Check if a date is a holiday
    const isHoliday = (day: Date): boolean => {
      const dateString = format(day, 'yyyy-MM-dd');
      return holidays.some(holiday => holiday.date === dateString);
    };
    
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
          const isEgyptianWeekend = day.getDay() === 5 || day.getDay() === 6; // Friday (5) or Saturday (6)
          const isDayHoliday = isHoliday(day);
          
          return (
            <DayCell
              key={day.toISOString()}
              $isSelected={!!isSelected}
              $isInRange={!!isInRange}
              $isToday={isDayToday}
              $isOtherMonth={!isCurrentMonth}
              $isFuture={isDayFuture}
              $isWeekend={isEgyptianWeekend}
              $isHoliday={isDayHoliday}
              onClick={() => handleDayClick(day)}
              disabled={isDayFuture || !isCurrentMonth || isEgyptianWeekend || isDayHoliday}
            >
              {format(day, 'd')}
            </DayCell>
          );
        })}
      </CalendarGrid>
    );
  };

  const formatDateRange = () => {
    if (isRTL) {
      // Arabic format
      if (selectedStart && selectedEnd) {
        return `${format(selectedStart, 'd MMMM, yyyy', { locale })} - ${format(selectedEnd, 'd MMMM, yyyy', { locale })}`;
      } else if (selectedStart) {
        return `${format(selectedStart, 'd MMMM, yyyy', { locale })} - `;
      }
    } else {
      // English format  
      if (selectedStart && selectedEnd) {
        return `${format(selectedStart, 'd MMMM, yyyy')} - ${format(selectedEnd, 'd MMMM, yyyy')}`;
      } else if (selectedStart) {
        return `${format(selectedStart, 'd MMMM, yyyy')} - `;
      }
    }
    return '';
  };

  // Function to get the current display label based on the date range
  const getCurrentDisplayLabel = () => {
    // Check if it's today
    const todayRange = getTodayRange();
    if (isSameDay(value.startDate, todayRange.start) && isSameDay(value.endDate, todayRange.end)) {
      return t('common.today');
    }
    
    // Check if it's this week
    const thisWeekRange = getThisWeekRange();
    if (isSameDay(value.startDate, thisWeekRange.start) && isSameDay(value.endDate, thisWeekRange.end)) {
      return t('common.thisWeek');
    }
    
    // Check if it's this month  
    const thisMonthRange = getThisMonthRange();
    if (isSameDay(value.startDate, thisMonthRange.start) && isSameDay(value.endDate, thisMonthRange.end)) {
      return t('common.thisMonth');
    }
    
    // Check if it's this quarter
    const thisQuarterRange = getThisQuarterRange();
    if (isSameDay(value.startDate, thisQuarterRange.start) && isSameDay(value.endDate, thisQuarterRange.end)) {
      return t('common.thisQuarter');
    }
    
    // Check if it's this year
    const thisYearRange = getThisYearRange();
    if (isSameDay(value.startDate, thisYearRange.start) && isSameDay(value.endDate, thisYearRange.end)) {
      return t('common.thisYear');
    }
    
    // Otherwise it's custom
    return `${format(value.startDate, 'd MMM yyyy', { locale })} - ${format(value.endDate, 'd MMM yyyy', { locale })}`;
  };

  return (
    <PickerContainer ref={containerRef}>
      <PickerButton $isRTL={isRTL} onClick={() => setIsOpen(!isOpen)}>
        <span className="icon">📅</span>
        {getCurrentDisplayLabel()}
      </PickerButton>
      
      <DropdownContainer $isOpen={isOpen} $isRTL={isRTL}>
        <TabContainer>
          <Tab 
            $isActive={activeTab === 'today'} 
            $isRTL={isRTL}
            onClick={() => handleTabChange('today')}
          >
            {t('common.today')}
          </Tab>
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

        <RangeDisplay $isRTL={isRTL}>
          <span>{formatDateRange()}</span>
        </RangeDisplay>

        <DoneButton $isRTL={isRTL} onClick={handleDone}>
          {t('common.done')}
        </DoneButton>
      </DropdownContainer>
    </PickerContainer>
  );
};

export default DateRangePicker; 
