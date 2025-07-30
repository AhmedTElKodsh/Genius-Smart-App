import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// Styled Components
const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const TriggerButton = styled.button<{ isDarkMode: boolean; isActive: boolean }>`
  background: ${props => props.isActive ? '#DAA520' : (props.isDarkMode ? '#404040' : '#f8f9fa')};
  color: ${props => props.isActive ? '#ffffff' : (props.isDarkMode ? '#ffffff' : '#333333')};
  border: 1px solid ${props => props.isActive ? '#DAA520' : (props.isDarkMode ? '#555' : '#e0e0e0')};
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.isActive ? '600' : '400'};
  
  &:hover {
    background: ${props => props.isActive ? '#B8860B' : (props.isDarkMode ? '#4a4a4a' : '#f0f0f0')};
  }
`;

const DropdownContainer = styled.div<{ isOpen: boolean; isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  ${props => props.isRTL ? 'left: 0' : 'right: 0'};
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#e0e0e0'};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 720px;
  max-width: 90vw;
  max-height: 500px;
  overflow-y: auto;
  z-index: 9999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const PeriodSelectorContainer = styled.div<{ isRTL: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const PeriodSection = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border-radius: 8px;
  padding: 16px;
`;

const PeriodTitle = styled.h4<{ isDarkMode: boolean; isRTL: boolean }>`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const QuickSelectContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
  align-items: center;
`;

const QuickSelectRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: center;
  width: 100%;
`;

const QuickSelectButton = styled.button<{ isDarkMode: boolean; isActive?: boolean }>`
  background: ${props => props.isActive ? '#DAA520' : (props.isDarkMode ? '#505050' : '#ffffff')};
  color: ${props => props.isActive ? '#ffffff' : (props.isDarkMode ? '#ffffff' : '#333333')};
  border: 1px solid ${props => props.isActive ? '#DAA520' : (props.isDarkMode ? '#666' : '#e0e0e0')};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: ${props => props.isActive ? '600' : '400'};
  min-width: 100px;
  text-align: center;
  
  &:hover {
    background: ${props => props.isActive ? '#B8860B' : (props.isDarkMode ? '#5a5a5a' : '#f0f0f0')};
  }
`;

const CalendarContainer = styled.div<{ isDarkMode: boolean }>`
  margin-top: 8px;
`;

const CalendarHeader = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 0 4px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const MonthYear = styled.div<{ isDarkMode: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
`;

const NavButton = styled.button<{ isDarkMode: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 16px;
  cursor: pointer;
  padding: 2px 6px;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#505050' : '#f0f0f0'};
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
    if (props.isToday) return props.isDarkMode ? '#505050' : '#f0f0f0';
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
      return props.isDarkMode ? '#505050' : '#e0e0e0';
    }};
  }
`;

const DateRangeDisplay = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f8f9fa'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#e0e0e0'};
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  text-align: center;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  justify-content: center;
`;

const ActionButton = styled.button<{ isDarkMode: boolean; variant: 'primary' | 'secondary' }>`
  padding: 10px 32px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  min-width: 100px;
  
  ${props => props.variant === 'primary' ? `
    background: #DAA520;
    color: #ffffff;
    
    &:hover {
      background: #B8860B;
    }
    
    &:disabled {
      background: #ccc;
      cursor: not-allowed;
    }
  ` : `
    background: ${props.isDarkMode ? '#404040' : '#f0f0f0'};
    color: ${props.isDarkMode ? '#ffffff' : '#333333'};
    border: 1px solid ${props.isDarkMode ? '#555' : '#e0e0e0'};
    
    &:hover {
      background: ${props.isDarkMode ? '#4a4a4a' : '#e0e0e0'};
    }
  `}
`;

// Types
interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface ComparisonPeriods {
  base: DateRange;
  comparison: DateRange;
}

interface ComparisonDateRangePickerProps {
  isActive: boolean;
  onPeriodsChange: (periods: ComparisonPeriods) => void;
  onClose: () => void;
}

const ComparisonDateRangePicker: React.FC<ComparisonDateRangePickerProps> = ({ 
  isActive, 
  onPeriodsChange,
  onClose 
}) => {
  const { isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [basePeriod, setBasePeriod] = useState<DateRange>({ start: null, end: null });
  const [comparisonPeriod, setComparisonPeriod] = useState<DateRange>({ start: null, end: null });
  const [activeSelection, setActiveSelection] = useState<'base' | 'comparison'>('base');
  const [baseQuickSelect, setBaseQuickSelect] = useState<string>('thisMonth');
  const [comparisonQuickSelect, setComparisonQuickSelect] = useState<string>('thisWeek');
  const [currentMonthBase, setCurrentMonthBase] = useState(new Date());
  const [currentMonthComparison, setCurrentMonthComparison] = useState(new Date());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Define translations
  const translations = {
    comparePeriods: isRTL ? 'مقارنة الفترات' : 'Compare Periods',
    hideComparison: isRTL ? 'إخفاء المقارنة' : 'Hide Comparison',
    basePeriod: isRTL ? 'الفترة الأساسية' : 'Base Period',
    comparisonPeriod: isRTL ? 'فترة المقارنة' : 'Comparison Period',
    today: isRTL ? 'اليوم' : 'Today',
    thisWeek: isRTL ? 'هذا الأسبوع' : 'This Week',
    thisMonth: isRTL ? 'هذا الشهر' : 'This Month',
    thisQuarter: isRTL ? 'هذا الربع' : 'This Quarter',
    thisYear: isRTL ? 'هذا العام' : 'This Year',
    lastMonth: isRTL ? 'الشهر الماضي' : 'Last Month',
    apply: isRTL ? 'تطبيق' : 'Apply',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
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

  // Initialize with default periods
  useEffect(() => {
    handleQuickSelect('thisMonth', 'base');
    handleQuickSelect('thisWeek', 'comparison');
  }, []);

  const handleQuickSelect = (type: string, period: 'base' | 'comparison') => {
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
      
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
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

    if (period === 'base') {
      setBaseQuickSelect(type);
      setBasePeriod({ start, end });
      setCurrentMonthBase(new Date(start));
    } else {
      setComparisonQuickSelect(type);
      setComparisonPeriod({ start, end });
      setCurrentMonthComparison(new Date(start));
    }
  };

  const handleDayClick = (date: Date, period: 'base' | 'comparison') => {
    const currentRange = period === 'base' ? basePeriod : comparisonPeriod;
    
    if (!currentRange.start || (currentRange.start && currentRange.end)) {
      // First click or reset
      if (period === 'base') {
        setBasePeriod({ start: date, end: null });
        setBaseQuickSelect('');
      } else {
        setComparisonPeriod({ start: date, end: null });
        setComparisonQuickSelect('');
      }
    } else {
      // Second click
      if (date < currentRange.start) {
        if (period === 'base') {
          setBasePeriod({ start: date, end: currentRange.start });
        } else {
          setComparisonPeriod({ start: date, end: currentRange.start });
        }
      } else {
        if (period === 'base') {
          setBasePeriod({ start: currentRange.start, end: date });
        } else {
          setComparisonPeriod({ start: currentRange.start, end: date });
        }
      }
    }
  };

  const isDateInRange = (date: Date, range: DateRange) => {
    if (!range.start || !range.end) return false;
    return date >= range.start && date <= range.end;
  };

  const isDateSelected = (date: Date, range: DateRange) => {
    if (range.start && date.toDateString() === range.start.toDateString()) return true;
    if (range.end && date.toDateString() === range.end.toDateString()) return true;
    return false;
  };

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = translations.months[date.getMonth()];
    const year = date.getFullYear();
    
    return isRTL ? `${day} ${month}، ${year}` : `${day} ${month}, ${year}`;
  };

  const getDateRangeText = (range: DateRange) => {
    if (!range.start) return '';
    if (!range.end) return formatDate(range.start) + ' - ';
    return `${formatDate(range.start)} - ${formatDate(range.end)}`;
  };

  const navigateMonth = (direction: number, period: 'base' | 'comparison') => {
    if (period === 'base') {
      const newMonth = new Date(currentMonthBase);
      newMonth.setMonth(newMonth.getMonth() + direction);
      setCurrentMonthBase(newMonth);
    } else {
      const newMonth = new Date(currentMonthComparison);
      newMonth.setMonth(newMonth.getMonth() + direction);
      setCurrentMonthComparison(newMonth);
    }
  };

  const getDaysInMonth = (currentMonth: Date) => {
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

  const handleApply = () => {
    if (basePeriod.start && basePeriod.end && comparisonPeriod.start && comparisonPeriod.end) {
      onPeriodsChange({
        base: basePeriod,
        comparison: comparisonPeriod
      });
      setIsOpen(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (!isActive) {
      onClose();
    }
  };

  const renderCalendar = (period: 'base' | 'comparison') => {
    const currentMonth = period === 'base' ? currentMonthBase : currentMonthComparison;
    const dateRange = period === 'base' ? basePeriod : comparisonPeriod;
    
    return (
      <CalendarContainer isDarkMode={isDarkMode}>
        <CalendarHeader isDarkMode={isDarkMode} isRTL={isRTL}>
          <NavButton isDarkMode={isDarkMode} onClick={() => navigateMonth(-1, period)}>
            {isRTL ? '›' : '‹'}
          </NavButton>
          <MonthYear isDarkMode={isDarkMode}>
            {translations.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </MonthYear>
          <NavButton isDarkMode={isDarkMode} onClick={() => navigateMonth(1, period)}>
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
          {getDaysInMonth(currentMonth).map((date, index) => {
            if (!date) {
              return <div key={index} />;
            }

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <DayCell
                key={index}
                isDarkMode={isDarkMode}
                isSelected={isDateSelected(date, dateRange)}
                isInRange={isDateInRange(date, dateRange)}
                isWeekend={isWeekend}
                isToday={isToday}
                onClick={() => handleDayClick(date, period)}
              >
                {date.getDate()}
              </DayCell>
            );
          })}
        </DaysGrid>
      </CalendarContainer>
    );
  };

  return (
    <Container ref={dropdownRef}>
      <TriggerButton
        isDarkMode={isDarkMode}
        isActive={isActive}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isActive ? translations.hideComparison : translations.comparePeriods}
      </TriggerButton>

      <DropdownContainer isOpen={isOpen} isDarkMode={isDarkMode} isRTL={isRTL}>
        <PeriodSelectorContainer isRTL={isRTL}>
          <PeriodSection isDarkMode={isDarkMode}>
            <PeriodTitle isDarkMode={isDarkMode} isRTL={isRTL}>
              {translations.basePeriod}
            </PeriodTitle>
            
            <QuickSelectContainer>
              <QuickSelectRow>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'today'}
                  onClick={() => handleQuickSelect('today', 'base')}
                >
                  {translations.today}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisWeek'}
                  onClick={() => handleQuickSelect('thisWeek', 'base')}
                >
                  {translations.thisWeek}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisMonth'}
                  onClick={() => handleQuickSelect('thisMonth', 'base')}
                >
                  {translations.thisMonth}
                </QuickSelectButton>
              </QuickSelectRow>
              <QuickSelectRow>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'lastMonth'}
                  onClick={() => handleQuickSelect('lastMonth', 'base')}
                >
                  {translations.lastMonth}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisQuarter'}
                  onClick={() => handleQuickSelect('thisQuarter', 'base')}
                >
                  {translations.thisQuarter}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisYear'}
                  onClick={() => handleQuickSelect('thisYear', 'base')}
                >
                  {translations.thisYear}
                </QuickSelectButton>
              </QuickSelectRow>
            </QuickSelectContainer>

            {renderCalendar('base')}
          </PeriodSection>

          <PeriodSection isDarkMode={isDarkMode}>
            <PeriodTitle isDarkMode={isDarkMode} isRTL={isRTL}>
              {translations.comparisonPeriod}
            </PeriodTitle>
            
            <QuickSelectContainer>
              <QuickSelectRow>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'today'}
                  onClick={() => handleQuickSelect('today', 'comparison')}
                >
                  {translations.today}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisWeek'}
                  onClick={() => handleQuickSelect('thisWeek', 'comparison')}
                >
                  {translations.thisWeek}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisMonth'}
                  onClick={() => handleQuickSelect('thisMonth', 'comparison')}
                >
                  {translations.thisMonth}
                </QuickSelectButton>
              </QuickSelectRow>
              <QuickSelectRow>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'lastMonth'}
                  onClick={() => handleQuickSelect('lastMonth', 'comparison')}
                >
                  {translations.lastMonth}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisQuarter'}
                  onClick={() => handleQuickSelect('thisQuarter', 'comparison')}
                >
                  {translations.thisQuarter}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisYear'}
                  onClick={() => handleQuickSelect('thisYear', 'comparison')}
                >
                  {translations.thisYear}
                </QuickSelectButton>
              </QuickSelectRow>
            </QuickSelectContainer>

            {renderCalendar('comparison')}
          </PeriodSection>
        </PeriodSelectorContainer>

        <DateRangeDisplay isDarkMode={isDarkMode} isRTL={isRTL}>
          {getDateRangeText(basePeriod)} {basePeriod.start && basePeriod.end && comparisonPeriod.start && comparisonPeriod.end ? (isRTL ? ' مقابل ' : ' vs ') : ''} {getDateRangeText(comparisonPeriod)}
        </DateRangeDisplay>

        <ButtonContainer>
          <ActionButton
            isDarkMode={isDarkMode}
            variant="primary"
            onClick={handleApply}
            disabled={!basePeriod.start || !basePeriod.end || !comparisonPeriod.start || !comparisonPeriod.end}
          >
            {translations.apply}
          </ActionButton>
          <ActionButton
            isDarkMode={isDarkMode}
            variant="secondary"
            onClick={handleCancel}
          >
            {translations.cancel}
          </ActionButton>
        </ButtonContainer>
      </DropdownContainer>
    </Container>
  );
};

export default ComparisonDateRangePicker;