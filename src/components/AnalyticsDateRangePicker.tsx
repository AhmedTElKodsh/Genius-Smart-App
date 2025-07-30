import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// Styled Components
const Container = styled.div`
  position: relative;
  margin-right: 20px;
`;

const TriggerButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#e0e0e0'};
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  min-width: 160px;
  justify-content: space-between;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#4a4a4a' : '#f0f0f0'};
  }
`;

const DropdownIcon = styled.span<{ isOpen: boolean }>`
  font-size: 12px;
  transform: ${props => props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition: transform 0.2s ease;
`;

const DropdownContainer = styled.div<{ isOpen: boolean; isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  top: 100%;
  ${props => props.isRTL ? 'right: 0' : 'left: 0'};
  margin-top: 8px;
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#e0e0e0'};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 20px;
  width: 360px;
  max-height: 500px;
  overflow-y: auto;
  z-index: 1000;
  display: ${props => props.isOpen ? 'block' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const QuickSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  align-items: center;
`;

const QuickSelectRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%;
`;

const QuickSelectButton = styled.button<{ isDarkMode: boolean; isActive?: boolean }>`
  background: ${props => props.isActive ? '#DAA520' : (props.isDarkMode ? '#404040' : '#f8f9fa')};
  color: ${props => props.isActive ? '#ffffff' : (props.isDarkMode ? '#ffffff' : '#333333')};
  border: 1px solid ${props => props.isActive ? '#DAA520' : (props.isDarkMode ? '#555' : '#e0e0e0')};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.isActive ? '600' : '400'};
  min-width: 100px;
  text-align: center;
  
  &:hover {
    background: ${props => props.isActive ? '#B8860B' : (props.isDarkMode ? '#4a4a4a' : '#f0f0f0')};
  }
`;

const CalendarContainer = styled.div<{ isDarkMode: boolean }>`
  margin-bottom: 16px;
`;

const CalendarHeader = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 0 4px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const MonthYear = styled.div<{ isDarkMode: boolean }>`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
`;

const NavButton = styled.button<{ isDarkMode: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#404040' : '#f0f0f0'};
    border-radius: 4px;
  }
`;

const WeekDaysRow = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 8px;
`;

const WeekDay = styled.div<{ isDarkMode: boolean }>`
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#b0b0b0' : '#666666'};
  padding: 4px;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const DayCell = styled.button<{
  isDarkMode: boolean;
  isSelected?: boolean;
  isInRange?: boolean;
  isWeekend?: boolean;
  isDisabled?: boolean;
  isToday?: boolean;
}>`
  aspect-ratio: 1;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  cursor: ${props => props.isDisabled ? 'not-allowed' : 'pointer'};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 32px;
  
  background: ${props => {
    if (props.isSelected) return '#DAA520';
    if (props.isInRange) return props.isDarkMode ? 'rgba(218, 165, 32, 0.2)' : 'rgba(218, 165, 32, 0.15)';
    if (props.isToday) return props.isDarkMode ? '#4a4a4a' : '#f0f0f0';
    return 'transparent';
  }};
  
  color: ${props => {
    if (props.isDisabled || props.isWeekend) return props.isDarkMode ? '#666' : '#ccc';
    if (props.isSelected) return '#ffffff';
    return props.isDarkMode ? '#ffffff' : '#333333';
  }};
  
  font-weight: ${props => (props.isSelected || props.isToday) ? '600' : '400'};
  
  &:hover:not(:disabled) {
    background: ${props => {
      if (props.isSelected) return '#B8860B';
      if (props.isInRange) return props.isDarkMode ? 'rgba(218, 165, 32, 0.3)' : 'rgba(218, 165, 32, 0.25)';
      return props.isDarkMode ? '#404040' : '#e0e0e0';
    }};
  }
`;

const DateRangeDisplay = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#e0e0e0'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  text-align: center;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const DoneButton = styled.button<{ isDarkMode: boolean }>`
  width: 100%;
  background: #DAA520;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  text-align: center;
  
  &:hover {
    background: #B8860B;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Types
interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface AnalyticsDateRangePickerProps {
  onDateRangeChange: (range: DateRange) => void;
}

const AnalyticsDateRangePicker: React.FC<AnalyticsDateRangePickerProps> = ({ onDateRangeChange }) => {
  const { isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [quickSelect, setQuickSelect] = useState<string>('thisMonth');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define translations
  const translations = {
    today: isRTL ? 'اليوم' : 'Today',
    thisWeek: isRTL ? 'هذا الأسبوع' : 'This Week',
    thisMonth: isRTL ? 'هذا الشهر' : 'This Month',
    thisQuarter: isRTL ? 'هذا الربع' : 'This Quarter',
    thisYear: isRTL ? 'هذا العام' : 'This Year',
    done: isRTL ? 'تم' : 'Done',
    months: isRTL ? [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
    ] : [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ],
    weekDays: isRTL ? ['أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت'] : 
                      ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Initialize with this month
  useEffect(() => {
    handleQuickSelect('thisMonth');
  }, []);

  const handleQuickSelect = (type: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    switch (type) {
      case 'today':
        start = new Date(now);
        end = new Date(now);
        break;
      
      case 'thisWeek':
        const dayOfWeek = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - dayOfWeek);
        end = new Date(now);
        end.setDate(now.getDate() + (6 - dayOfWeek));
        break;
      
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      
      case 'thisQuarter':
        const quarter = Math.floor(now.getMonth() / 3);
        start = new Date(now.getFullYear(), quarter * 3, 1);
        end = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
    }

    setQuickSelect(type);
    setDateRange({ start, end });
    setCurrentMonth(new Date(start));
  };

  const handleDayClick = (date: Date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      // First click or reset
      setDateRange({ start: date, end: null });
      setQuickSelect('');
    } else {
      // Second click
      if (date < dateRange.start) {
        setDateRange({ start: date, end: dateRange.start });
      } else {
        setDateRange({ start: dateRange.start, end: date });
      }
    }
  };

  const isDateInRange = (date: Date) => {
    if (!dateRange.start || !dateRange.end) return false;
    return date >= dateRange.start && date <= dateRange.end;
  };

  const isDateSelected = (date: Date) => {
    if (dateRange.start && date.toDateString() === dateRange.start.toDateString()) return true;
    if (dateRange.end && date.toDateString() === dateRange.end.toDateString()) return true;
    return false;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = translations.months[date.getMonth()];
    const year = date.getFullYear();
    
    return isRTL ? `${day} ${month}، ${year}` : `${day} ${month}, ${year}`;
  };

  const getDateRangeText = () => {
    if (!dateRange.start) return '';
    if (!dateRange.end) return formatDate(dateRange.start) + ' - ';
    return `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`;
  };

  const getButtonText = () => {
    const quickSelectLabels: { [key: string]: string } = {
      today: translations.today,
      thisWeek: translations.thisWeek,
      thisMonth: translations.thisMonth,
      thisQuarter: translations.thisQuarter,
      thisYear: translations.thisYear
    };
    
    return quickSelectLabels[quickSelect] || getDateRangeText() || translations.thisMonth;
  };

  const navigateMonth = (direction: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const handleDone = () => {
    if (dateRange.start && dateRange.end) {
      onDateRangeChange(dateRange);
      setIsOpen(false);
    }
  };

  return (
    <Container ref={dropdownRef}>
      <TriggerButton
        isDarkMode={isDarkMode}
        isRTL={isRTL}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{getButtonText()}</span>
        <DropdownIcon isOpen={isOpen}>▼</DropdownIcon>
      </TriggerButton>

      <DropdownContainer isOpen={isOpen} isDarkMode={isDarkMode} isRTL={isRTL}>
        <QuickSelectContainer>
          <QuickSelectRow>
            <QuickSelectButton
              isDarkMode={isDarkMode}
              isActive={quickSelect === 'today'}
              onClick={() => handleQuickSelect('today')}
            >
              {translations.today}
            </QuickSelectButton>
            <QuickSelectButton
              isDarkMode={isDarkMode}
              isActive={quickSelect === 'thisWeek'}
              onClick={() => handleQuickSelect('thisWeek')}
            >
              {translations.thisWeek}
            </QuickSelectButton>
            <QuickSelectButton
              isDarkMode={isDarkMode}
              isActive={quickSelect === 'thisMonth'}
              onClick={() => handleQuickSelect('thisMonth')}
            >
              {translations.thisMonth}
            </QuickSelectButton>
          </QuickSelectRow>
          <QuickSelectRow>
            <QuickSelectButton
              isDarkMode={isDarkMode}
              isActive={quickSelect === 'thisQuarter'}
              onClick={() => handleQuickSelect('thisQuarter')}
            >
              {translations.thisQuarter}
            </QuickSelectButton>
            <QuickSelectButton
              isDarkMode={isDarkMode}
              isActive={quickSelect === 'thisYear'}
              onClick={() => handleQuickSelect('thisYear')}
            >
              {translations.thisYear}
            </QuickSelectButton>
          </QuickSelectRow>
        </QuickSelectContainer>

        <CalendarContainer isDarkMode={isDarkMode}>
          <CalendarHeader isDarkMode={isDarkMode} isRTL={isRTL}>
            <NavButton isDarkMode={isDarkMode} onClick={() => navigateMonth(-1)}>
              {isRTL ? '›' : '‹'}
            </NavButton>
            <MonthYear isDarkMode={isDarkMode}>
              {translations.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </MonthYear>
            <NavButton isDarkMode={isDarkMode} onClick={() => navigateMonth(1)}>
              {isRTL ? '‹' : '›'}
            </NavButton>
          </CalendarHeader>

          <WeekDaysRow>
            {translations.weekDays.map((day, index) => (
              <WeekDay key={index} isDarkMode={isDarkMode}>
                {day}
              </WeekDay>
            ))}
          </WeekDaysRow>

          <DaysGrid>
            {getDaysInMonth().map((date, index) => {
              if (!date) {
                return <div key={index} />;
              }

              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              const isToday = date.toDateString() === new Date().toDateString();

              return (
                <DayCell
                  key={index}
                  isDarkMode={isDarkMode}
                  isSelected={isDateSelected(date)}
                  isInRange={isDateInRange(date)}
                  isWeekend={isWeekend}
                  isToday={isToday}
                  onClick={() => handleDayClick(date)}
                >
                  {date.getDate()}
                </DayCell>
              );
            })}
          </DaysGrid>
        </CalendarContainer>

        <DateRangeDisplay isDarkMode={isDarkMode} isRTL={isRTL}>
          {getDateRangeText()}
        </DateRangeDisplay>

        <DoneButton
          isDarkMode={isDarkMode}
          onClick={handleDone}
          disabled={!dateRange.start || !dateRange.end}
        >
          {translations.done}
        </DoneButton>
      </DropdownContainer>
    </Container>
  );
};

export default AnalyticsDateRangePicker;