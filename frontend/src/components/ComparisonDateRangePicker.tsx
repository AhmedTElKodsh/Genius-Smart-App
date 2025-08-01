import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

// Styled Components
const Container = styled.div<{ isOpen?: boolean }>`
  position: relative;
  display: inline-block;
  ${props => props.isOpen && `z-index: 1000;`}
`;

const Backdrop = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 99998;
  display: ${props => props.isOpen ? 'block' : 'none'};
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

const DropdownContainer = styled.div<{ isOpen: boolean; isDarkMode: boolean; isRTL: boolean; top: number; left: number }>`
  position: fixed;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#e0e0e0'};
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  padding: 20px;
  width: 720px;
  max-width: 90vw;
  max-height: 90vh;
  min-height: 700px;
  height: auto;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 99999;
  display: ${props => props.isOpen ? 'block' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
  /* Custom scrollbar styles */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${props => props.isDarkMode ? '#1a1a1a' : '#f1f1f1'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${props => props.isDarkMode ? '#555' : '#888'};
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: ${props => props.isDarkMode ? '#666' : '#999'};
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    padding: 16px;
    min-height: 650px;
    max-height: 95vh;
  }
  
  @media (max-height: 800px) {
    min-height: 600px;
    max-height: 95vh;
    padding: 16px;
  }
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
  padding: 20px;
  min-height: 320px;
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
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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
    const handleDocumentClick = (event: MouseEvent) => {
      // Don't do anything if dropdown is not open
      if (!isOpen) return;
      
      const target = event.target as HTMLElement;
      const dropdown = document.querySelector('[data-dropdown="comparison-picker"]');
      const button = buttonRef.current;
      
      // Check if the target or any parent has data-prevent-close attribute
      let currentElement = target;
      while (currentElement) {
        if (currentElement.getAttribute && currentElement.getAttribute('data-prevent-close') === 'true') {
          return; // Don't close the dropdown
        }
        currentElement = currentElement.parentElement as HTMLElement;
      }
      
      // Check if click originated from inside dropdown or button
      const isClickInsideDropdown = dropdown && dropdown.contains(target);
      const isClickOnButton = button && button.contains(target);
      
      // Only close if click is truly outside both dropdown and button
      if (!isClickInsideDropdown && !isClickOnButton) {
        setIsOpen(false);
      }
    };

    // Add listener with a delay to ensure all internal handlers run first
    const timer = setTimeout(() => {
      if (isOpen) {
        document.addEventListener('mousedown', handleDocumentClick);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [isOpen]);

  // Calculate dropdown position and handle scroll
  useEffect(() => {
    const updatePosition = () => {
      if (isOpen && buttonRef.current) {
        const buttonRect = buttonRef.current.getBoundingClientRect();
        const dropdownWidth = 720;
        const dropdownHeight = 700; // Increased to match min-height
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = buttonRect.left;
        let top = buttonRect.bottom + 8;
        
        // Check if dropdown would go below viewport
        if (top + dropdownHeight > viewportHeight) {
          // Position above the button if there's room
          if (buttonRect.top - dropdownHeight - 8 > 0) {
            top = buttonRect.top - dropdownHeight - 8;
          } else {
            // Otherwise, position at the bottom of viewport with some margin
            top = viewportHeight - dropdownHeight - 20;
          }
        }
        
        // Adjust horizontal position to keep dropdown within viewport
        if (isRTL) {
        // For RTL, align to the left edge of the button
        if (left + dropdownWidth > viewportWidth) {
          left = viewportWidth - dropdownWidth - 20;
        }
      } else {
        // For LTR, align to the right edge of the button
        left = buttonRect.right - dropdownWidth;
        if (left < 0) {
          left = 20;
        }
      }
      
      setDropdownPosition({ top, left });
      }
    };
    
    // Update position on open and when scrolling/resizing
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, isRTL]);

  // Initialize with default periods
  useEffect(() => {
    handleQuickSelect('thisMonth', 'base');
    handleQuickSelect('thisWeek', 'comparison');
  }, []);

  // Helper to prevent all event propagation
  const preventEventDefaults = (event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
      if (event.nativeEvent) {
        event.nativeEvent.stopImmediatePropagation();
      }
    }
  };

  // Create a click handler that prevents all defaults
  const createSafeClickHandler = (handler: Function) => {
    return (e: React.MouseEvent) => {
      preventEventDefaults(e);
      handler(e);
    };
  };

  const handleQuickSelect = (type: string, period: 'base' | 'comparison', event?: React.MouseEvent) => {
    // Prevent the click from bubbling up and closing the dropdown
    preventEventDefaults(event);
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

  const handleDayClick = (date: Date, period: 'base' | 'comparison', event?: React.MouseEvent) => {
    // Prevent the click from bubbling up and closing the dropdown
    preventEventDefaults(event);
    
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

  const navigateMonth = (direction: number, period: 'base' | 'comparison', event?: React.MouseEvent) => {
    // Prevent the click from bubbling up and closing the dropdown
    preventEventDefaults(event);
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
                <CalendarContainer 
            isDarkMode={isDarkMode}
            onClick={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.nativeEvent.stopImmediatePropagation();
            }}
          >
            <CalendarHeader isDarkMode={isDarkMode} isRTL={isRTL}>
          <NavButton isDarkMode={isDarkMode} onClick={(e) => navigateMonth(-1, period, e)}>
            {isRTL ? '›' : '‹'}
          </NavButton>
          <MonthYear isDarkMode={isDarkMode}>
            {translations.months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </MonthYear>
          <NavButton isDarkMode={isDarkMode} onClick={(e) => navigateMonth(1, period, e)}>
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
                onClick={(e) => handleDayClick(date, period, e)}
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
    <>
      {/* Backdrop removed to fix click issues - using proper click outside handler instead */}
      <Container ref={dropdownRef} isOpen={isOpen}>
      <TriggerButton
        ref={buttonRef}
        isDarkMode={isDarkMode}
        isActive={isActive}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isActive ? translations.hideComparison : translations.comparePeriods}
      </TriggerButton>

            <DropdownContainer 
        isOpen={isOpen}
        isDarkMode={isDarkMode}
        isRTL={isRTL}
        top={dropdownPosition.top}
        left={dropdownPosition.left}
        data-dropdown="comparison-picker"
        data-prevent-close="true"
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
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
                  onClick={(e) => handleQuickSelect('today', 'base', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.today}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisWeek'}
                  onClick={(e) => handleQuickSelect('thisWeek', 'base', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.thisWeek}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisMonth'}
                  onClick={(e) => handleQuickSelect('thisMonth', 'base', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.thisMonth}
                </QuickSelectButton>
              </QuickSelectRow>
              <QuickSelectRow>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'lastMonth'}
                  onClick={(e) => handleQuickSelect('lastMonth', 'base', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.lastMonth}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisQuarter'}
                  onClick={(e) => handleQuickSelect('thisQuarter', 'base', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.thisQuarter}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={baseQuickSelect === 'thisYear'}
                  onClick={(e) => handleQuickSelect('thisYear', 'base', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
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
                  onClick={(e) => handleQuickSelect('today', 'comparison', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.today}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisWeek'}
                  onClick={(e) => handleQuickSelect('thisWeek', 'comparison', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.thisWeek}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisMonth'}
                  onClick={(e) => handleQuickSelect('thisMonth', 'comparison', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.thisMonth}
                </QuickSelectButton>
              </QuickSelectRow>
              <QuickSelectRow>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'lastMonth'}
                  onClick={(e) => handleQuickSelect('lastMonth', 'comparison', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.lastMonth}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisQuarter'}
                  onClick={(e) => handleQuickSelect('thisQuarter', 'comparison', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  {translations.thisQuarter}
                </QuickSelectButton>
                <QuickSelectButton
                  isDarkMode={isDarkMode}
                  isActive={comparisonQuickSelect === 'thisYear'}
                  onClick={(e) => handleQuickSelect('thisYear', 'comparison', e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onMouseUp={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
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
    </>
  );
};

export default ComparisonDateRangePicker;
