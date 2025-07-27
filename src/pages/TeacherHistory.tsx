import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import SummaryDetailModal from '../components/SummaryDetailModal';

// Styled Components
const Container = styled.div<{ isDarkMode: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
  };
  padding: 0;
  position: relative;
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  padding: 60px 20px 30px 20px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const HeaderText = styled.div<{ isRTL: boolean }>`
  flex: 1;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const Greeting = styled.h1<{ isRTL: boolean }>`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 5px 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Subtitle = styled.p<{ isRTL: boolean }>`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const ProfileImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face') center/cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const MainContent = styled.div<{ isDarkMode: boolean }>`
  flex: 1;
  background: ${props => props.isDarkMode ? '#1a1a1a' : '#f5f5f5'};
  border-radius: 25px 25px 0 0;
  min-height: calc(100vh - 150px);
  padding: 0;
  position: relative;
`;

const HistoryCard = styled.div<{ isDarkMode: boolean; isRTL: boolean; isExpanded?: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  margin: 20px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  ${props => props.isExpanded && `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    border-radius: 0;
    z-index: 1000;
    overflow-y: auto;
    padding: 80px 20px 100px 20px;
  `}
`;

const CardHeader = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const CardTitle = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const BackButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: #DAA520;
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  transform: ${props => props.isRTL ? 'rotate(180deg)' : 'none'};

  &:hover {
    background: #B8860B;
    transform: ${props => props.isRTL ? 'rotate(180deg) translateY(-1px)' : 'translateY(-1px)'};
  }
`;

const ViewAllButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: none;
  border: none;
  color: #DAA520;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: rgba(218, 165, 32, 0.1);
  }
`;

const MonthNavigation = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  gap: 20px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const MonthButton = styled.button<{ isDarkMode: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #DAA520;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s;

  &:hover {
    background: #B8860B;
    transform: translateY(-1px);
  }
`;

const CurrentMonth = styled.h3<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin: 0;
  min-width: 120px;
  text-align: center;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const AttendanceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const AttendanceItem = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.1)' : '#FFF8DC'};
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  border: ${props => props.isDarkMode ? '1px solid #DAA520' : 'none'};
  border-left: ${props => props.isRTL ? 'none' : '4px solid #DAA520'};
  border-right: ${props => props.isRTL ? '4px solid #DAA520' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  gap: 0;
`;

const DateInfo = styled.div<{ isRTL: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: white;
  border-radius: 8px;
  padding: 6px 8px;
  flex: 0.7; /* Increased from 0.5 to accommodate longer Arabic day names */
  margin-right: ${props => props.isRTL ? '0' : '8px'};
  margin-left: ${props => props.isRTL ? '8px' : '0'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  min-width: 60px; /* Ensure minimum width for longer day names */
`;

const DateNumber = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const DayName = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 11px; /* Slightly smaller to fit longer Arabic day names */
  color: #666;
  font-weight: 500;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  white-space: nowrap; /* Prevent text wrapping */
  text-align: center;
`;

const TimeInfo = styled.div<{ isRTL: boolean }>`
  display: flex;
  flex: 2.3; /* Adjusted from 2.5 to balance with increased DateInfo flex */
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const TimeColumn = styled.div<{ isRTL: boolean; isFirst?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  flex: 1;
  padding: 6px 4px; /* Reduced padding to give more space for text */
  min-width: 0; /* Allow flex items to shrink below their min-content size */
  
  /* Always show border on the right side of the first column */
  /* This creates a separator between the two columns regardless of RTL/LTR */
  border-right: ${props => props.isFirst ? '1px solid rgba(218, 165, 32, 0.3)' : 'none'};
  border-left: none;
`;

const TimeLabel = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 16px; /* Slightly smaller to fit better */
  font-weight: bold;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin-bottom: 4px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  white-space: nowrap; /* Prevent text wrapping */
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: center;
  line-height: 1.2;
`;

const TimeValue = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 16px;
  font-weight: normal;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  white-space: nowrap; /* Prevent time value wrapping */
  text-align: center;
`;

const SummarySection = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  margin: 20px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 10px rgba(0, 0, 0, 0.3)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  position: relative;
  overflow: visible;
`;

const SummaryHeader = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const SummaryTitle = styled.h3<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const FilterDropdown = styled.div`
  position: relative;
  overflow: visible;
`;

const DropdownButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#404040' : '#f0f0f0'};
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#666'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};

  &:hover {
    background: ${props => props.isDarkMode ? '#505050' : '#e8e8e8'};
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean; isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  top: 100%;
  ${props => props.isRTL ? 'left: 0;' : 'right: 0;'}
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 12px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
    : '0 4px 20px rgba(0, 0, 0, 0.15)'
  };
  border: ${props => props.isDarkMode ? '1px solid #404040' : 'none'};
  padding: 8px 0;
  min-width: 150px;
  max-width: 200px;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '8px' : '0'});
  transition: all 0.2s;
  
  /* Ensure dropdown stays within parent bounds */
  ${props => props.isRTL ? 'right: auto;' : 'left: auto;'}
`;

const DropdownItem = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: none;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: ${props => props.isDarkMode ? '#404040' : '#f5f5f5'};
  }
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryItem = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.1)' : '#FFF8DC'};
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: ${props => props.isDarkMode ? '1px solid #DAA520' : 'none'};
  border-left: ${props => props.isRTL ? 'none' : '4px solid #DAA520'};
  border-right: ${props => props.isRTL ? '4px solid #DAA520' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const SummaryLabel = styled.span<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 15px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-weight: 500;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const SummaryValue = styled.span<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const BottomNavigation = styled.div<{ isDarkMode: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  padding: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid ${props => props.isDarkMode ? '#404040' : '#e0e0e0'};
  z-index: 100;
`;

const NavItem = styled.button<{ active?: boolean; isDarkMode: boolean; isRTL: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${props => props.active ? '#DAA520' : (props.isDarkMode ? '#ccc' : '#999')};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: rgba(218, 165, 32, 0.1);
  }
`;

const NavIcon = styled.div`
  font-size: 20px;
`;

const NavLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

// Custom date picker modal and components (reused from TeacherHomeAdvanced)
const DatePickerModal = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s;
`;

const DatePickerContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 24px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  border: ${props => props.isDarkMode ? '1px solid #404040' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const DayCell = styled.div<{ isSelected: boolean; isInRange: boolean; isDarkMode: boolean }>`
  padding: 8px;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  background: ${props => {
    if (props.isSelected) return '#DAA520';
    if (props.isInRange) return props.isDarkMode ? 'rgba(218, 165, 32, 0.3)' : 'rgba(218, 165, 32, 0.2)';
    return 'transparent';
  }};
  
  &:hover {
    background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.5)' : 'rgba(218, 165, 32, 0.3)'};
  }
`;

// Types
interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours?: number;
  isLate?: boolean;
  lateMinutes?: number;
  overtimeMinutes?: number;
  overtime?: number;
  status?: string;
  type?: string;
  hasPermission?: boolean | string;
  reason?: string;
  allowedAbsence?: string;
  authorizedAbsence?: string;
}

interface DisplayRecord {
  date: string;
  dayName: string;
  checkIn: string;
  checkOut: string;
}

interface SummaryData {
  allowedAbsence: number;
  unallowedAbsence: number;
  authorizedAbsence: number;
  unauthorizedAbsence: number;
  overtime: number;
  lateArrival: number;
}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

const TeacherHistory: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  // State management
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [displayData, setDisplayData] = useState<DisplayRecord[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData>({
    allowedAbsence: 0,
    unallowedAbsence: 0,
    authorizedAbsence: 0,
    unauthorizedAbsence: 0,
    overtime: 0,
    lateArrival: 0
  });
  const [filterPeriod, setFilterPeriod] = useState('Last month');
  const [filterDisplayText, setFilterDisplayText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const getCurrentDateRange = () => {
    // For TeacherHistory, we calculate the date range based on the current month view
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed (0=Jan, 5=June)
    
    // Build date strings directly to avoid timezone issues
    const startDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate(); // Get last day of month
    const endDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    
    const dateRange = {
      start: new Date(startDateStr + 'T00:00:00.000Z'), 
      end: new Date(endDateStr + 'T23:59:59.999Z')
    };
    

    return dateRange;
  };

  // Handle summary card clicks
  const handleSummaryCardClick = (category: string) => {


    setSelectedCategory(category);
    setShowDetailModal(true);
  };

  // Get filter display text based on current language
  const getFilterDisplayText = (filter: string) => {
    switch (filter) {
      case 'This week': return t.thisWeek;
      case 'This month': return t.thisMonth;
      case 'Last week': return t.lastWeek;
      case 'Last month': return t.lastMonth;
      case 'Custom': return t.custom;
      default: return isRTL ? 'اختيار' : 'Select';
    }
  };

  // Handle filter changes
  const handleFilterChange = (filter: string) => {
    setFilterPeriod(filter);
    setFilterDisplayText(getFilterDisplayText(filter));
    setIsDropdownOpen(false);
    if (filter === 'Custom') {
      setIsDatePickerOpen(true);
    } else {
      setIsDatePickerOpen(false);
    }
  };

  // Handle navigation
  const handleNavigation = (route: string) => {
    switch (route) {
      case 'home':
        navigate('/teacher/home-advanced');
        break;
      case 'notifications':
        navigate('/teacher/notifications');
        break;
      case 'profile':
        navigate('/teacher/profile');
        break;
    }
  };

  // Handle date range confirmation
  const handleDateRangeConfirm = () => {
    setIsDatePickerOpen(false);
    setFilterPeriod('Custom');
    fetchAttendanceSummary();
  };

  // Render calendar for date picker
  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} />);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isSelected = Boolean(
        (dateRange.start && date.toDateString() === dateRange.start.toDateString()) ||
        (dateRange.end && date.toDateString() === dateRange.end.toDateString())
      );
      const isInRange = Boolean(
        dateRange.start && dateRange.end &&
        date >= dateRange.start && date <= dateRange.end
      );

      days.push(
        <DayCell
          key={day}
          isSelected={isSelected}
          isInRange={isInRange}
          isDarkMode={isDarkMode}
          onClick={() => handleDateSelect(date)}
        >
          {day}
        </DayCell>
      );
    }

    return days;
  };

  // Handle date selection for custom range
  const handleDateSelect = (date: Date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: null });
    } else if (dateRange.start && !dateRange.end) {
      if (date >= dateRange.start) {
        setDateRange({ ...dateRange, end: date });
      } else {
        setDateRange({ start: date, end: dateRange.start });
      }
    }
  };

  // Load teacher data on mount
  useEffect(() => {
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
      setTeacherData(JSON.parse(storedTeacherData));
    } else {
      navigate('/teacher/signin');
    }
  }, [navigate]);

  // Initialize filter display text when language changes
  useEffect(() => {
    setFilterDisplayText(getFilterDisplayText(filterPeriod));
  }, [language, filterPeriod]);



  const fetchAttendanceHistory = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;

      const response = await fetch(`http://localhost:5000/api/attendance/history/${teacherData.id}?year=${year}&month=${month}`);
      const data = await response.json();

      if (data.success) {
        // Store the complete data for SummaryDetailModal AND create display data for the UI
        const completeData = data.data || [];
        setAttendanceData(completeData); // Store complete data for modal
        
        // Get the latest 3 days for condensed view or 7 days for expanded view (for UI display)
        const limit = isExpanded ? 7 : 3;
        const latestRecords = completeData.slice(-limit).reverse();
        
        setDisplayData(latestRecords.map((record: any) => {
          // Format time to ensure consistent "HH:MM AM/PM" format (AM/PM after time)
          const formatTime = (timeStr: string) => {
            if (!timeStr) return '';
            
            // If it's already in the correct format (time AM/PM), return as is
            if (timeStr.match(/^\d{1,2}:\d{2}\s?(AM|PM)$/i)) {
              return timeStr;
            }
            
            // If it's in Arabic format (AM/PM time), reformat it
            if (timeStr.match(/^(AM|PM)\s?\d{1,2}:\d{2}$/i)) {
              const parts = timeStr.split(/\s+/);
              if (parts.length === 2) {
                const ampm = parts[0];
                const time = parts[1];
                return `${time} ${ampm}`;
              }
            }
            
            // Try to parse and format the time - always use en-US to ensure AM/PM comes after
            try {
              // Handle various time formats
              let timeToparse = timeStr;
              
              // If time has AM/PM at the beginning, move it to the end first
              if (timeStr.match(/^(AM|PM)\s/i)) {
                const match = timeStr.match(/^(AM|PM)\s(.+)/i);
                if (match) {
                  timeToparse = `${match[2]} ${match[1]}`;
                }
              }
              
              // Parse the time
              const time = new Date(`1970-01-01T${timeToparse.replace(/\s?(AM|PM)/i, '')}`);
              const formatted = time.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              });
              
              return formatted;
            } catch {
              return timeStr; // Return original if parsing fails
            }
          };

          return {
              date: new Date(record.date).getDate().toString(),
              dayName: t.dayAbbreviations[new Date(record.date).getDay()],
              checkIn: formatTime(record.checkInTime || record.checkIn) || '08:15 AM',
              checkOut: formatTime(record.checkOutTime || record.checkOut) || '03:05 PM'
            };
        }));
      }
    } catch (error) {
      console.error('Error fetching attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceSummary = async () => {
    if (!teacherData) return;

    try {
      // For TeacherHistory, always use the currently displayed month
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth(); // 0-indexed (0=Jan, 6=July)
      
      // Calculate start and end dates for the current month
      const startDate = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = new Date(year, month, lastDay);
      
      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
      });

      const response = await fetch(`http://localhost:5000/api/attendance/summary/${teacherData.id}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setSummaryData(data.data);
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    }
  };

  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  // Fetch data when teacher data, current date, or expansion state changes
  useEffect(() => {
    if (teacherData) {
      fetchAttendanceHistory();
      fetchAttendanceSummary();
    }
  }, [teacherData, currentDate, filterPeriod, isExpanded]);

  // Handle click outside date picker to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDatePickerOpen) {
        const target = event.target as Element;
        const datePickerModal = document.querySelector('[data-date-picker-modal]');
        const datePickerContent = document.querySelector('[data-date-picker-content]');
        
        if (datePickerModal && !datePickerContent?.contains(target)) {
          setIsDatePickerOpen(false);
        }
      }
    };

    if (isDatePickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDatePickerOpen]);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isDropdownOpen) {
        const target = event.target as Element;
        const dropdown = document.querySelector('[data-filter-dropdown]');
        
        if (dropdown && !dropdown.contains(target)) {
          setIsDropdownOpen(false);
        }
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isDropdownOpen]);










  return (
    <Container isDarkMode={isDarkMode}>
      <Header isDarkMode={isDarkMode} isRTL={isRTL}>
        <HeaderText isRTL={isRTL}>
          <Greeting isRTL={isRTL}>
            {isRTL 
              ? `${teacherData?.name || 'أستاذ محمود'} ,أهلاً` 
              : t.greeting(teacherData?.name || 'Mr. Mahmoud')
            }
          </Greeting>
          <Subtitle isRTL={isRTL}>{t.reviewAttendance}</Subtitle>
        </HeaderText>
        <ProfileImage />
      </Header>

      <MainContent isDarkMode={isDarkMode}>
        <HistoryCard isDarkMode={isDarkMode} isRTL={isRTL} isExpanded={isExpanded}>
          <CardHeader isRTL={isRTL}>
            {isExpanded && (
              <BackButton 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => setIsExpanded(false)}
              >
                ←
              </BackButton>
            )}
            <CardTitle isDarkMode={isDarkMode} isRTL={isRTL}>
              {t.myHistory}
            </CardTitle>
            {!isExpanded && (
              <ViewAllButton 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => setIsExpanded(true)}
              >
                {t.viewAll}
              </ViewAllButton>
            )}
          </CardHeader>

          {/* Month Navigation */}
          <MonthNavigation isRTL={isRTL}>
            <MonthButton 
              isDarkMode={isDarkMode}
              onClick={() => handleMonthChange('prev')}
            >
              {isRTL ? '›' : '‹'}
            </MonthButton>
            <CurrentMonth isDarkMode={isDarkMode} isRTL={isRTL}>
              {t.monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CurrentMonth>
            <MonthButton 
              isDarkMode={isDarkMode}
              onClick={() => handleMonthChange('next')}
            >
              {isRTL ? '‹' : '›'}
            </MonthButton>
          </MonthNavigation>

          {/* Attendance Records */}
          <AttendanceList>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: isDarkMode ? '#ccc' : '#666' }}>
                Loading...
              </div>
            ) : attendanceData.length > 0 ? (
              displayData.map((record, index) => (
                <AttendanceItem key={index} isDarkMode={isDarkMode} isRTL={isRTL}>
                  <DateInfo isRTL={isRTL}>
                    <DateNumber isDarkMode={isDarkMode} isRTL={isRTL}>
                      {record.date}
                    </DateNumber>
                    <DayName isDarkMode={isDarkMode} isRTL={isRTL}>
                      {record.dayName}
                    </DayName>
                  </DateInfo>
                  <TimeInfo isRTL={isRTL}>
                    <TimeColumn isRTL={isRTL} isFirst={true}>
                      <TimeLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                        {t.checkIn}
                      </TimeLabel>
                      <TimeValue isDarkMode={isDarkMode} isRTL={isRTL}>
                        {record.checkIn}
                      </TimeValue>
                    </TimeColumn>
                    <TimeColumn isRTL={isRTL} isFirst={false}>
                      <TimeLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                        {t.checkOut}
                      </TimeLabel>
                      <TimeValue isDarkMode={isDarkMode} isRTL={isRTL}>
                        {record.checkOut}
                      </TimeValue>
                    </TimeColumn>
                  </TimeInfo>
                </AttendanceItem>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: isDarkMode ? '#ccc' : '#666' }}>
                No attendance records found for this month.
              </div>
            )}
          </AttendanceList>
        </HistoryCard>

        {/* Summary Section - Only show when not expanded */}
        {!isExpanded && (
          <SummarySection isDarkMode={isDarkMode} isRTL={isRTL}>
            <SummaryHeader isRTL={isRTL}>
              <SummaryTitle isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.summaryTitle}
              </SummaryTitle>
              <FilterDropdown data-filter-dropdown>
                <DropdownButton 
                  isDarkMode={isDarkMode} 
                  isRTL={isRTL}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {filterDisplayText || (isRTL ? 'اختيار' : 'Select')} {isRTL ? '◄' : '▼'}
                </DropdownButton>
                <DropdownMenu isOpen={isDropdownOpen} isDarkMode={isDarkMode} isRTL={isRTL}>
                  <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange('This week')}>
                    {t.thisWeek}
                  </DropdownItem>
                  <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange('This month')}>
                    {t.thisMonth}
                  </DropdownItem>
                  <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange('Last week')}>
                    {t.lastWeek}
                  </DropdownItem>
                  <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange('Last month')}>
                    {t.lastMonth}
                  </DropdownItem>
                  <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange('Custom')}>
                    {t.custom}
                  </DropdownItem>
                </DropdownMenu>
              </FilterDropdown>
            </SummaryHeader>

            <SummaryGrid>
              <SummaryItem 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => handleSummaryCardClick('allowedAbsence')}
                style={{ cursor: 'pointer' }}
              >
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.allowedAbsence}
                </SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                  {(isRTL && summaryData.allowedAbsence === 0) ? `.. ${t.days}` : `${summaryData.allowedAbsence.toString().padStart(2, '0')} ${t.days}`}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => handleSummaryCardClick('unallowedAbsence')}
                style={{ cursor: 'pointer' }}
              >
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.unallowedAbsence}
                </SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                  {(isRTL && summaryData.unallowedAbsence === 0) ? `.. ${t.days}` : `${summaryData.unallowedAbsence.toString().padStart(2, '0')} ${t.days}`}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => handleSummaryCardClick('authorizedAbsence')}
                style={{ cursor: 'pointer' }}
              >
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.authorizedAbsence}
                </SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                  {(isRTL && summaryData.authorizedAbsence === 0) ? `.. ${t.days}` : `${summaryData.authorizedAbsence.toString().padStart(2, '0')} ${t.days}`}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => handleSummaryCardClick('unauthorizedAbsence')}
                style={{ cursor: 'pointer' }}
              >
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.unauthorizedAbsence}
                </SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                  {(isRTL && summaryData.unauthorizedAbsence === 0) ? `.. ${t.days}` : `${summaryData.unauthorizedAbsence.toString().padStart(2, '0')} ${t.days}`}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => handleSummaryCardClick('overtime')}
                style={{ cursor: 'pointer' }}
              >
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.overtime}
                </SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                  {(isRTL && summaryData.overtime === 0) ? `.. ${t.days}` : `${summaryData.overtime.toString().padStart(2, '0')} ${t.days}`}
                </SummaryValue>
              </SummaryItem>
              <SummaryItem 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => handleSummaryCardClick('lateArrival')}
                style={{ cursor: 'pointer' }}
              >
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.lateArrival}
                </SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                  {(isRTL && summaryData.lateArrival === 0) ? `.. ${t.days}` : `${summaryData.lateArrival.toString().padStart(2, '0')} ${t.days}`}
                </SummaryValue>
              </SummaryItem>
            </SummaryGrid>
          </SummarySection>
        )}

        <div style={{ height: '100px' }} />
      </MainContent>

      {/* Date Picker Modal */}
      <DatePickerModal isOpen={isDatePickerOpen} data-date-picker-modal>
        <DatePickerContent isDarkMode={isDarkMode} isRTL={isRTL} data-date-picker-content>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', marginBottom: '20px' }}>
            {renderCalendar()}
          </div>

          {dateRange.start && dateRange.end && (
            <div style={{
              background: isDarkMode ? 'rgba(218, 165, 32, 0.2)' : '#FFF8DC',
              border: `2px solid #DAA520`,
              borderRadius: '12px',
              padding: '16px',
              margin: '20px 0',
              textAlign: 'center',
              color: isDarkMode ? '#f0f0f0' : '#333'
            }}>
              {dateRange.start.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })} - {dateRange.end.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
            </div>
          )}

          <button
            onClick={handleDateRangeConfirm}
            disabled={!dateRange.start || !dateRange.end}
            style={{
              width: '100%',
              background: '#DAA520',
              color: 'white',
              border: 'none',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              opacity: (!dateRange.start || !dateRange.end) ? 0.5 : 1
            }}
          >
            {t.done}
          </button>
        </DatePickerContent>
      </DatePickerModal>

      {/* Bottom Navigation */}
      <BottomNavigation isDarkMode={isDarkMode}>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('home')}>
          <NavIcon>🏠</NavIcon>
          <NavLabel>{t.home}</NavLabel>
        </NavItem>
        <NavItem active isDarkMode={isDarkMode} isRTL={isRTL}>
          <NavIcon>📊</NavIcon>
          <NavLabel>{t.history}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('notifications')}>
          <NavIcon>🔔</NavIcon>
          <NavLabel>{t.notifications}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('profile')}>
          <NavIcon>👤</NavIcon>
          <NavLabel>{t.profile}</NavLabel>
        </NavItem>
      </BottomNavigation>

      {/* Summary Detail Modal */}
      <SummaryDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        category={selectedCategory}
        data={attendanceData}
        dateRange={getCurrentDateRange()}
        filter={filterPeriod}
      />
    </Container>
  );
};

export default TeacherHistory; 