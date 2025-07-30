import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfQuarter, endOfQuarter, startOfYear, endOfYear, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

export interface AnalyticsDateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

interface AnalyticsDateRangePickerProps {
  value: AnalyticsDateRange;
  onChange: (range: AnalyticsDateRange) => void;
  onClose?: () => void;
}

const PickerContainer = styled.div<{ $isRTL: boolean }>`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 20px;
  min-width: 380px;
  max-width: 420px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  z-index: 10000;
  position: relative;
`;

const PickerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const PickerTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 4px;
  color: #718096;
  border-radius: 4px;
  
  &:hover {
    background: #f7fafc;
  }
`;

const QuickOptionsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  width: 100%;
`;

const QuickOptionsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  width: 100%;
`;

const QuickOptionsCentered = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  width: 100%;
  max-width: 240px;
  margin: 0 auto;
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

const CalendarSection = styled.div`
  margin-bottom: 20px;
`;

const MonthNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const MonthLabel = styled.h4`
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
`;

const NavButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  color: #718096;
  
  &:hover {
    background: #f7fafc;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  padding: 8px;
`;

const CalendarDay = styled.button<{ 
  $isSelected: boolean; 
  $isInRange: boolean; 
  $isToday: boolean; 
  $isOtherMonth: boolean;
  $isWeekend: boolean;
}>`
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: ${props => props.$isSelected ? '600' : '400'};
  cursor: ${props => props.$isOtherMonth ? 'not-allowed' : 'pointer'};
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
    if (props.$isOtherMonth) return '#ccc';
    if (props.$isSelected) return '#ffffff';
    if (props.$isWeekend && !props.$isSelected && !props.$isOtherMonth) return '#999999';
    if (props.$isToday) return '#141F25';
    return '#141F25';
  }};
  
  &:hover {
    background: ${props => {
      if (props.$isOtherMonth) return 'transparent';
      if (props.$isSelected) return '#D6B10E';
      return '#f5f5f5';
    }};
  }
`;

const CustomRangeSection = styled.div`
  margin-top: 20px;
  border-top: 1px solid #e1e7ec;
  padding-top: 16px;
`;

const DateInputsRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
`;

const DateInput = styled.input<{ $isRTL?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  background: #F3F1E4;
  border: 1px solid #D6B10E;
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #666;
  text-align: center !important;
  text-align-last: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  width: 100%;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #D6B10E;
    box-shadow: 0 0 0 2px rgba(214, 177, 14, 0.1);
    text-align: center !important;
  }
  
  &::placeholder {
    text-align: center;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  justify-content: center;
  width: 100%;
`;

const ActionButton = styled.button<{ $isRTL?: boolean }>`
  padding: 12px 32px;
  background: #D6B10E;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  text-align: center;
  
  &:hover {
    background: #c0a00d;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AnalyticsDateRangePicker: React.FC<AnalyticsDateRangePickerProps> = ({
  value,
  onChange,
  onClose
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const t = (key: string) => (translations as any)[language]?.[key] || key;

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<AnalyticsDateRange>(value);
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isSelectingRange, setIsSelectingRange] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedRange(value);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // Initialize with "Today" as default selection
  useEffect(() => {
    handlePresetOption('today');
  }, []);

  const getPresetRange = (type: string): AnalyticsDateRange => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let label: string;

    switch (type) {
      case 'today':
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        label = t('common.today');
        break;
      case 'week':
        startDate = startOfWeek(now);
        endDate = endOfWeek(now);
        label = t('common.thisWeek');
        break;
      case 'month':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        label = t('common.thisMonth');
        break;
      case 'quarter':
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        label = t('common.thisQuarter');
        break;
      case 'year':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        label = t('common.thisYear');
        break;
      default:
        startDate = startOfDay(now);
        endDate = endOfDay(now);
        label = t('common.today');
    }

    return { startDate, endDate, label };
  };

  const handlePresetOption = (type: string) => {
    const range = getPresetRange(type);
    setSelectedRange(range);
    setSelectedOption(type);
    setIsSelectingRange(false);
    setTempStartDate(null);
  };

  const handleDayClick = (day: Date) => {
    if (!isSelectingRange) {
      setIsSelectingRange(true);
      setTempStartDate(day);
      setSelectedOption('');
    } else {
      if (tempStartDate) {
        const startDate = day < tempStartDate ? day : tempStartDate;
        const endDate = day > tempStartDate ? day : tempStartDate;
        const label = `${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`;
        
        setSelectedRange({ startDate, endDate, label });
        setIsSelectingRange(false);
        setTempStartDate(null);
      }
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    const dayHeaders = isRTL ? 
      ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'] : 
      ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    
    return (
      <CalendarGrid>
        {dayHeaders.map((day, index) => (
          <WeekdayHeader key={index}>{day}</WeekdayHeader>
        ))}
        {days.map(day => {
          const isInCurrentMonth = isSameMonth(day, currentMonth);
          const isSelectedStart = isSameDay(day, selectedRange.startDate);
          const isSelectedEnd = isSameDay(day, selectedRange.endDate);
          // Show temp start date highlighting when selecting range
          const isTempStart = tempStartDate && isSameDay(day, tempStartDate);
          const isInRange = day >= selectedRange.startDate && day <= selectedRange.endDate;
          const isDayToday = isToday(day);
          const isWeekend = day.getDay() === 5 || day.getDay() === 6; // Friday (5) and Saturday (6)
          
          return (
            <CalendarDay
              key={day.toString()}
              onClick={() => handleDayClick(day)}
              $isSelected={isSelectedStart || isSelectedEnd || !!isTempStart}
              $isInRange={isInRange && !isTempStart}
              $isToday={isDayToday}
              $isOtherMonth={!isInCurrentMonth}
              $isWeekend={isWeekend}
            >
              {format(day, 'd')}
            </CalendarDay>
          );
        })}
      </CalendarGrid>
    );
  };

  const formatDateRange = () => {
    if (tempStartDate && !selectedRange.endDate) {
      // Show incomplete range when only start date is selected
      return `${format(tempStartDate, 'd MMM')} - `;
    }
    if (!selectedRange.startDate || !selectedRange.endDate) return '';
    
    const startStr = format(selectedRange.startDate, 'd MMM, yyyy');
    const endStr = format(selectedRange.endDate, 'd MMM, yyyy');
    return `${startStr} - ${endStr}`;
  };

  const handleDone = () => {
    // If user is in the middle of selecting a range and only has start date, complete with start date as end date
    if (isSelectingRange && tempStartDate && (!selectedRange.startDate || !selectedRange.endDate)) {
      const completedRange = {
        startDate: tempStartDate,
        endDate: tempStartDate,
        label: format(tempStartDate, 'MMM dd, yyyy')
      };
      setSelectedRange(completedRange);
      setIsSelectingRange(false);
      setTempStartDate(null);
      onChange(completedRange);
      onClose?.();
      return;
    }

    // Ensure we have a valid date range before applying
    if (selectedRange.startDate && selectedRange.endDate) {
      onChange(selectedRange);
      onClose?.();
    } else {
      // If no range is selected, default to "today"
      const todayRange = getPresetRange('today');
      setSelectedRange(todayRange);
      onChange(todayRange);
      onClose?.();
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => direction === 'prev' ? subMonths(prev, 1) : addMonths(prev, 1));
  };

  return (
    <PickerContainer ref={containerRef} $isRTL={isRTL}>
      <QuickOptionsGrid>
        <QuickOptionsRow>
          <QuickOption 
            $isActive={selectedOption === 'today'} 
            onClick={() => handlePresetOption('today')}
            $isRTL={isRTL}
          >
            {t('common.today')}
          </QuickOption>
          <QuickOption 
            $isActive={selectedOption === 'week'} 
            onClick={() => handlePresetOption('week')}
            $isRTL={isRTL}
          >
            {t('common.thisWeek')}
          </QuickOption>
          <QuickOption 
            $isActive={selectedOption === 'month'} 
            onClick={() => handlePresetOption('month')}
            $isRTL={isRTL}
          >
            {t('common.thisMonth')}
          </QuickOption>
        </QuickOptionsRow>
        <QuickOptionsCentered>
          <QuickOption 
            $isActive={selectedOption === 'quarter'} 
            onClick={() => handlePresetOption('quarter')}
            $isRTL={isRTL}
          >
            {t('common.thisQuarter')}
          </QuickOption>
          <QuickOption 
            $isActive={selectedOption === 'year'} 
            onClick={() => handlePresetOption('year')}
            $isRTL={isRTL}
          >
            {t('common.thisYear')}
          </QuickOption>
        </QuickOptionsCentered>
      </QuickOptionsGrid>

      <CalendarSection>
        <MonthNavigation>
          <NavButton onClick={() => navigateMonth('prev')}>
            {isRTL ? '→' : '←'}
          </NavButton>
          <MonthLabel>
            {format(currentMonth, 'MMMM yyyy')}
          </MonthLabel>
          <NavButton onClick={() => navigateMonth('next')}>
            {isRTL ? '←' : '→'}
          </NavButton>
        </MonthNavigation>
        {renderCalendar()}
      </CalendarSection>

      <CustomRangeSection>
        <DateInputsRow>
          <DateInput type="text" value={formatDateRange()} readOnly $isRTL={isRTL} />
        </DateInputsRow>
        <ActionButtons>
          <ActionButton 
            onClick={handleDone} 
            $isRTL={isRTL}
            type="button"
            aria-label={t('common.done')}
          >
            {t('common.done')}
          </ActionButton>
        </ActionButtons>
      </CustomRangeSection>
    </PickerContainer>
  );
};

export default AnalyticsDateRangePicker;