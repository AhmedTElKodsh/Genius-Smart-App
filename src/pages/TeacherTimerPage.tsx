import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import SummaryDetailModal from '../components/SummaryDetailModal';
import SendRequestModal from '../components/SendRequestModal';
import CheckOutConfirmationModal from '../components/CheckOutConfirmationModal';

// Theme-aware styled components
const Container = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  min-height: 100vh;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
  };
  padding: 0;
  position: relative;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  font-family: ${props => props.isRTL ? 'Tajawal, Cairo, sans-serif' : 'system-ui, sans-serif'};
`;

const Header = styled.div<{ isDarkMode: boolean }>`
  padding: 50px 20px 30px 20px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : 'white'};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Greeting = styled.h1<{ isRTL: boolean }>`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 5px 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Subtitle = styled.p<{ isRTL: boolean; isDarkMode: boolean }>`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const ProfilePicture = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.3);
  background: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face') center/cover;
`;

const MainContent = styled.div<{ isDarkMode: boolean }>`
  flex: 1;
  background: ${props => props.isDarkMode ? '#1a1a1a' : '#f5f5f5'};
  border-radius: 25px 25px 0 0;
  min-height: calc(100vh - 150px);
  padding: 0 0 120px 0;
  position: relative;
`;

const WorkTimeCard = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 30px 20px;
  margin: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
  position: relative;
`;

const WorkTimeHeader = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const WorkTimeTitle = styled.h2<{ isDarkMode: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin: 0;
`;

const SendRequestButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: transparent;
  border: none;
  color: ${props => props.isDarkMode ? '#DAA520' : '#B8860B'};
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.1)' : 'rgba(184, 134, 11, 0.1)'};
  }
`;

const TimerDisplay = styled.div`
  text-align: center;
  margin: 40px 0;
`;

const TimerText = styled.div<{ isDarkMode: boolean }>`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin-bottom: 10px;
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  
  @media (max-width: 768px) {
    font-size: 40px;
  }
  
  @media (max-width: 480px) {
    font-size: 36px;
  }
`;

const DateText = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 16px;
  color: ${props => props.isDarkMode ? '#888' : '#666'};
  margin-bottom: 40px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const ButtonContainer = styled.div<{ isRTL: boolean }>`
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 40px 0;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  flex-wrap: wrap;
  
  @media (max-width: 480px) {
    gap: 10px;
    margin: 30px 0;
  }
`;

const CheckOutButton = styled.button<{ isDarkMode: boolean }>`
  background: transparent;
  border: 2px solid ${props => props.isDarkMode ? '#DAA520' : '#B8860B'};
  color: ${props => props.isDarkMode ? '#DAA520' : '#B8860B'};
  padding: 15px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
  min-width: 140px;
  
  &:hover:not(:disabled) {
    background: ${props => props.isDarkMode ? '#DAA520' : '#B8860B'};
    color: white;
  }
  
  &:active:not(:disabled) {
    transform: scale(0.95);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    padding: 12px 30px;
    font-size: 14px;
    min-width: 120px;
  }
`;

const BreakButton = styled.button<{ isDarkMode: boolean; isOnBreak: boolean }>`
  background: ${props => props.isDarkMode ? '#DAA520' : '#B8860B'};
  border: none;
  color: white;
  padding: 15px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  opacity: ${props => props.isOnBreak ? 0.7 : 1};
  font-family: inherit;
  min-width: 140px;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#B8860B' : '#8B7213'};
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 480px) {
    padding: 12px 30px;
    font-size: 14px;
    min-width: 120px;
  }
`;

const AttendanceInfo = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 20px 0;
  padding: 20px;
  background: rgba(218, 165, 32, 0.1);
  border-radius: 12px;
  flex-direction: row; /* Always keep horizontal layout */
  min-height: 80px; /* Ensure consistent height */
`;

const AttendanceItem = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  flex: 1;
  max-width: 100px; /* Prevent stretching */
`;

const AttendanceTime = styled.div<{ isDarkMode: boolean }>`
  width: 70px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
  color: white;
  border-radius: 50%;
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(218, 165, 32, 0.3);
  white-space: nowrap;
  line-height: 1;
  padding: 2px;
`;

const AttendanceLabel = styled.div<{ isDarkMode: boolean }>`
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
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
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '8px' : '0'});
  transition: all 0.2s;
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
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.2)' : '#F5F5DC'};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(218, 165, 32, 0.2);
  }
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

const NotificationBanner = styled.div<{ isDarkMode: boolean; isRTL: boolean; type: 'success' | 'warning' }>`
  background: ${props => props.type === 'success' 
    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' 
    : 'linear-gradient(135deg, #f44336 0%, #da190b 100%)'
  };
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  box-shadow: 0 4px 12px ${props => props.type === 'success' 
    ? 'rgba(76, 175, 80, 0.3)' 
    : 'rgba(244, 67, 54, 0.3)'
  };
  animation: slideIn 0.5s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateY(-20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const NotificationText = styled.span<{ isRTL: boolean }>`
  font-size: 14px;
  font-weight: 500;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const NotificationIcon = styled.span<{ isRTL?: boolean }>`
  font-size: 18px;
  margin-right: ${props => props.isRTL ? '0' : '8px'};
  margin-left: ${props => props.isRTL ? '8px' : '0'};
`;

const BottomNavigation = styled.div<{ isDarkMode: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  padding: 15px 20px;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 100;
`;

const NavItem = styled.button<{ isDarkMode: boolean; isActive?: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${props => props.isActive 
    ? (props.isDarkMode ? '#DAA520' : '#B8860B')
    : (props.isDarkMode ? '#666' : '#999')
  };
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  font-family: inherit;
  
  &:hover {
    color: ${props => props.isDarkMode ? '#DAA520' : '#B8860B'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const NavIcon = styled.div`
  font-size: 24px;
  margin-bottom: 4px;
`;

const NavLabel = styled.div<{ isRTL?: boolean }>`
  font-size: 12px;
  font-weight: 500;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

// Date picker modal styles
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

const CalendarHeader = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const MonthYear = styled.h4<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const NavButton = styled.button<{ isRTL: boolean }>`
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
  transform: ${props => props.isRTL ? 'scaleX(-1)' : 'none'};

  &:hover {
    background: #B8860B;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 20px;
`;

const DayHeader = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  font-size: 12px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  padding: 8px 4px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const DayCell = styled.button<{ isSelected?: boolean; isInRange?: boolean; isToday?: boolean; isDarkMode: boolean }>`
  aspect-ratio: 1;
  border: none;
  background: ${props => 
    props.isSelected ? '#DAA520' : 
    props.isInRange ? 'rgba(218, 165, 32, 0.2)' :
    props.isToday ? (props.isDarkMode ? '#333' : '#f0f0f0') : 
    props.isDarkMode ? '#2a2a2a' : 'transparent'
  };
  color: ${props => 
    props.isSelected ? 'white' : 
    props.isDarkMode ? '#f0f0f0' : '#333'
  };
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${props => props.isSelected ? '#B8860B' : 'rgba(218, 165, 32, 0.1)'};
  }

  &:disabled {
    color: ${props => props.isDarkMode ? '#666' : '#ccc'};
    cursor: not-allowed;
  }
`;

const DateRangeDisplay = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.2)' : '#FFF8DC'};
  border: 2px solid #DAA520;
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  text-align: center;
  position: relative;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &::before {
    content: '';
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-bottom: 8px solid #DAA520;
  }
`;

const DoneButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 100%;
  background: #DAA520;
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: #B8860B;
  }
`;

interface TeacherTimerPageProps {}

interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface SummaryData {
  allowedAbsence: number;
  unallowedAbsence: number;
  authorizedAbsence: number;
  unauthorizedAbsence: number;
  overtime: number;
  lateArrival: number;
}

const TeacherTimerPage: React.FC<TeacherTimerPageProps> = () => {
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const t = translations[language];

  // Get initial timer data from navigation state
  const initialData = location.state || {};
  
  const [teacherData, setTeacherData] = useState<any>(null);
  const [time, setTime] = useState(initialData.time || '00:00:00');
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [actualCheckInTime, setActualCheckInTime] = useState<Date | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isEarlyCheckout, setIsEarlyCheckout] = useState(false);
  const [hoursWorked, setHoursWorked] = useState(0);
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('Last month'); // Use static string instead of t.lastMonth
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [summaryData, setSummaryData] = useState<SummaryData>({
    allowedAbsence: 0,
    unallowedAbsence: 0,
    authorizedAbsence: 0,
    unauthorizedAbsence: 0,
    overtime: 0,
    lateArrival: 0
  });
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(true);

  // Helper function to format time for Arabic (AM/PM after time)
  const formatTimeForLocale = (date: Date) => {
    const timeString = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    // For Arabic RTL, ensure AM/PM is after the time (not before)
    if (isRTL) {
      // Split the time string to ensure proper format
      const parts = timeString.split(' ');
      if (parts.length === 2) {
        const time = parts[0]; // e.g., "06:02"  
        const period = parts[1]; // e.g., "AM" or "PM"
        return `${time} ${period}`; // Ensure format is "06:02 AM"
      }
    }
    
    return timeString;
  };

  // Memoize calculateTimes function to prevent unnecessary re-calculations
  const calculateTimes = useCallback(() => {
    if (!actualCheckInTime) {
      // If no actual check-in time, use default or current time
      const now = new Date();
      const checkInTime = formatTimeForLocale(now);

      // Calculate expected check out time (8 hours later)
      const checkOutDate = new Date(now.getTime() + (8 * 60 * 60 * 1000));
      const checkOutTime = formatTimeForLocale(checkOutDate);

      // Calculate late time (if checked in after 8:00 AM)
      const eightAM = new Date(now);
      eightAM.setHours(8, 0, 0, 0);
      
      let lateTime = '00:00:00';
      if (now > eightAM) {
        const lateDiff = now.getTime() - eightAM.getTime();
        const lateHours = Math.floor(lateDiff / (1000 * 60 * 60));
        const lateMinutes = Math.floor((lateDiff % (1000 * 60 * 60)) / (1000 * 60));
        const lateSeconds = Math.floor((lateDiff % (1000 * 60)) / 1000);
        lateTime = `${lateHours.toString().padStart(2, '0')}:${lateMinutes.toString().padStart(2, '0')}:${lateSeconds.toString().padStart(2, '0')}`;
      }

      return { checkInTime, checkOutTime, lateTime };
    } else {
      // Use actual check-in time
      const checkInTime = formatTimeForLocale(actualCheckInTime);

      // Calculate expected check out time (8 hours later)
      const checkOutDate = new Date(actualCheckInTime.getTime() + (8 * 60 * 60 * 1000));
      const checkOutTime = formatTimeForLocale(checkOutDate);

      // Calculate late time (if checked in after 8:00 AM)
      const eightAM = new Date(actualCheckInTime);
      eightAM.setHours(8, 0, 0, 0);
      
      let lateTime = '00:00:00';
      if (actualCheckInTime > eightAM) {
        const lateDiff = actualCheckInTime.getTime() - eightAM.getTime();
        const lateHours = Math.floor(lateDiff / (1000 * 60 * 60));
        const lateMinutes = Math.floor((lateDiff % (1000 * 60 * 60)) / (1000 * 60));
        const lateSeconds = Math.floor((lateDiff % (1000 * 60)) / 1000);
        lateTime = `${lateHours.toString().padStart(2, '0')}:${lateMinutes.toString().padStart(2, '0')}:${lateSeconds.toString().padStart(2, '0')}`;
      }

      return { checkInTime, checkOutTime, lateTime };
    }
  }, [actualCheckInTime]);

  const { checkInTime, checkOutTime, lateTime } = calculateTimes();

  // Helper function to format time for attendance display
  const formatAttendanceTime = (timeStr: string) => {
    if (!timeStr) return '';
    
    // Convert time to format suitable for circular display
    if (timeStr.includes('AM') || timeStr.includes('PM')) {
      if (isRTL) {
        // Replace English AM/PM with Arabic equivalents
        return timeStr.replace('AM', ((t as any).timeFormat?.am || 'ص'))
                     .replace('PM', ((t as any).timeFormat?.pm || 'م'));
      }
    }
    
    return timeStr;
  };

  // Get current date info
  const today = new Date();
  const formattedDate = isRTL 
    ? `${today.toLocaleDateString('ar-EG', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })} - ${today.toLocaleDateString('ar-EG', { weekday: 'long' })}`
    : `${today.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })} - ${today.toLocaleDateString('en-US', { weekday: 'long' })}`;

  // Load teacher data on mount
  useEffect(() => {
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
      setTeacherData(JSON.parse(storedTeacherData));
    } else {
      navigate('/teacher/signin');
    }

    // Set actual check-in time when component mounts (simulates the actual check-in time)
    if (initialData.checkInTime && !actualCheckInTime) {
      setActualCheckInTime(new Date());
    }
  }, [navigate, initialData.checkInTime]); // Remove actualCheckInTime to prevent loop

  // Initialize filter period with correct translation
  useEffect(() => {
    setFilterPeriod(t.lastMonth);
  }, [t.lastMonth]);

  // Memoize fetchAttendanceSummary to prevent infinite re-renders
  const fetchAttendanceSummary = useCallback(async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        period: filterPeriod
      });

      // Add custom date range if it's a custom period
      if (filterPeriod.startsWith(t.custom + ':')) {
        // Extract dates from custom format
        const dateRangeStr = filterPeriod.replace(t.custom + ': ', '');
        const [startStr, endStr] = dateRangeStr.split(' - ');
        
        // Convert to ISO format
        const currentYear = new Date().getFullYear();
        const startDate = new Date(`${startStr} ${currentYear}`);
        const endDate = new Date(`${endStr} ${currentYear}`);
        
        queryParams.append('startDate', startDate.toISOString().split('T')[0]);
        queryParams.append('endDate', endDate.toISOString().split('T')[0]);
      }

      // Add timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

      const response = await fetch(`http://localhost:5000/api/attendance/summary/${teacherData.id}?${queryParams}`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setSummaryData(data.data);
      } else {
        console.warn('API returned success: false', data.message);
        // Set default data if API fails
        setSummaryData({
          allowedAbsence: 0,
          unallowedAbsence: 0,
          authorizedAbsence: 0,
          unauthorizedAbsence: 0,
          overtime: 0,
          lateArrival: 0
        });
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
      
      // Set fallback data when API fails
      setSummaryData({
        allowedAbsence: 0,
        unallowedAbsence: 0,
        authorizedAbsence: 0,
        unauthorizedAbsence: 0,
        overtime: 0,
        lateArrival: 0
      });
    } finally {
      setLoading(false);
    }
  }, [teacherData, filterPeriod, t.custom]);

  // Fetch attendance summary when teacher data or filter period changes
  useEffect(() => {
    if (teacherData) {
      fetchAttendanceSummary();
    }
  }, [teacherData, fetchAttendanceSummary]);

  // Fetch latest notification when teacher data is available
  useEffect(() => {
    const fetchLatestNotification = async () => {
      if (!teacherData) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/teachers/${teacherData.id}/notifications`);
        if (response.ok) {
          const data = await response.json();
          if (data.notifications && data.notifications.length > 0) {
            // Get the latest unread notification
            const unreadNotifications = data.notifications.filter((n: any) => !n.isRead);
            if (unreadNotifications.length > 0) {
              setLatestNotification(unreadNotifications[0]);
              setShowNotification(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    if (teacherData) {
      fetchLatestNotification();
      // Check for new notifications every 30 seconds
      const interval = setInterval(fetchLatestNotification, 30000);
      return () => clearInterval(interval);
    }
  }, [teacherData]);

  // Timer logic - only run when not on break
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!isOnBreak) {
      interval = setInterval(() => {
        setTime((prevTime: string) => {
          const [hours, minutes, seconds] = prevTime.split(':').map(Number);
          const totalSeconds = hours * 3600 + minutes * 60 + seconds + 1;
          const newHours = Math.floor(totalSeconds / 3600);
          const newMinutes = Math.floor((totalSeconds % 3600) / 60);
          const newSeconds = totalSeconds % 60;
          return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}:${newSeconds.toString().padStart(2, '0')}`;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOnBreak]);

  const handleTakeBreak = () => {
    setIsOnBreak(!isOnBreak);
  };

  const handleCheckOut = () => {
    // Calculate hours worked
    const now = new Date();
    let calculatedHoursWorked = 0;
    
    if (actualCheckInTime) {
      const timeDiff = now.getTime() - actualCheckInTime.getTime();
      calculatedHoursWorked = timeDiff / (1000 * 60 * 60); // Convert to hours
    }
    
    // Check if less than 8 hours worked
    const isEarly = calculatedHoursWorked < 8;
    
    setHoursWorked(calculatedHoursWorked);
    setIsEarlyCheckout(isEarly);
    setShowCheckoutModal(true);
  };

  const handleConfirmCheckOut = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/attendance/checkin/${teacherData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'checkout'
        }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.removeItem('teacherData');
        localStorage.removeItem('teacherToken');
        navigate('/');
      } else {
        console.error('Checkout failed:', data.message);
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
      setShowCheckoutModal(false);
    }
  };

  const handleNavigation = (page: string) => {
    switch (page) {
      case 'home':
        navigate('/teacher/home-advanced');
        break;
      case 'history':
        navigate('/teacher/history');
        break;
      case 'notifications':
        navigate('/teacher/notifications');
        break;
      case 'profile':
        navigate('/teacher/profile');
        break;
      default:
        break;
    }
  };

  const handleFilterChange = (filter: string) => {
    if (filter === t.custom) {
      setIsDatePickerOpen(true);
    } else {
      setFilterPeriod(filter);
    }
    setIsDropdownOpen(false);
    // Clear attendance data so it gets refetched with new filter
    setAttendanceData([]);
  };

  const handleDateSelect = (date: Date) => {
    if (!dateRange.start || (dateRange.start && dateRange.end)) {
      setDateRange({ start: date, end: null });
    } else {
      if (date >= dateRange.start) {
        setDateRange({ ...dateRange, end: date });
      } else {
        setDateRange({ start: date, end: null });
      }
    }
  };

  const handleDateRangeConfirm = () => {
    if (dateRange.start && dateRange.end) {
      const startStr = dateRange.start.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
      const endStr = dateRange.end.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
      setFilterPeriod(`${t.custom}: ${startStr} - ${endStr}`);
      setIsDatePickerOpen(false);
      setDateRange({ start: null, end: null });
      // Clear attendance data so it gets refetched with new date range
      setAttendanceData([]);
    }
  };

  const renderCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    // Day headers
    t.dayHeaders.forEach((day, index) => {
      days.push(<DayHeader key={`day-header-${index}`} isDarkMode={isDarkMode} isRTL={isRTL}>{day}</DayHeader>);
    });

    // Empty cells for days before month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(<DayCell key={`empty-${i}`} disabled isDarkMode={isDarkMode} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const isToday = date.toDateString() === today.toDateString();
      const isSelected = Boolean((dateRange.start && date.toDateString() === dateRange.start.toDateString()) ||
                        (dateRange.end && date.toDateString() === dateRange.end.toDateString()));
      const isInRange = Boolean(dateRange.start && dateRange.end &&
                       date >= dateRange.start && date <= dateRange.end);

      days.push(
        <DayCell
          key={day}
          isSelected={isSelected}
          isInRange={isInRange}
          isToday={isToday}
          isDarkMode={isDarkMode}
          onClick={() => handleDateSelect(date)}
        >
          {day}
        </DayCell>
      );
    }

    return days;
  };

  const fetchAttendanceData = async () => {
    if (!teacherData) return;
    
    try {
      // Determine date range based on current filter
      let startDate, endDate;
      
      if (filterPeriod.includes(t.custom)) {
        // Extract custom date range
        const dateRangeStr = filterPeriod.replace(t.custom + ': ', '');
        const [startStr, endStr] = dateRangeStr.split(' - ');
        startDate = new Date(startStr + ', ' + new Date().getFullYear());
        endDate = new Date(endStr + ', ' + new Date().getFullYear());
      } else {
        // Use current date range logic
        const now = new Date();
        
        if (filterPeriod === t.thisWeek) {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
          startDate = startOfWeek;
          endDate = endOfWeek;
        } else if (filterPeriod === t.thisMonth) {
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        } else if (filterPeriod === t.lastWeek) {
          const lastWeekStart = new Date(now);
          lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
          const lastWeekEnd = new Date(lastWeekStart);
          lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
          startDate = lastWeekStart;
          endDate = lastWeekEnd;
        } else { // lastMonth or default
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
          startDate = lastMonth;
          endDate = lastMonthEnd;
        }
      }
      
      // Format dates for API
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetch(`http://localhost:5000/api/attendance/teacher/${teacherData.id}?startDate=${startDateStr}&endDate=${endDateStr}&lang=${language}`);
      if (response.ok) {
        const data = await response.json();
        setAttendanceData(data.data || []);
      } else {
        console.error('Failed to fetch attendance data. Status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    }
  };

  const getCurrentDateRange = () => {
    // If using custom date range, return it
    if (filterPeriod.includes(t.custom) && dateRange.start && dateRange.end) {
      return dateRange;
    }
    
    // Calculate date range based on filter period
    const now = new Date();
    
    if (filterPeriod === t.thisWeek) {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // Saturday
      return { start: startOfWeek, end: endOfWeek };
    } else if (filterPeriod === t.thisMonth) {
      const year = now.getFullYear();
      const month = now.getMonth();
      const startDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      return { 
        start: new Date(startDateStr + 'T00:00:00.000Z'),
        end: new Date(endDateStr + 'T23:59:59.999Z')
      };
    } else if (filterPeriod === t.lastWeek) {
      const lastWeekStart = new Date(now);
      lastWeekStart.setDate(now.getDate() - now.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      return { start: lastWeekStart, end: lastWeekEnd };
    } else { // lastMonth or default
      const year = now.getFullYear();
      const month = now.getMonth() - 1;
      const adjustedYear = month < 0 ? year - 1 : year;
      const adjustedMonth = month < 0 ? 11 : month;
      const startDateStr = `${adjustedYear}-${(adjustedMonth + 1).toString().padStart(2, '0')}-01`;
      const lastDay = new Date(adjustedYear, adjustedMonth + 1, 0).getDate();
      const endDateStr = `${adjustedYear}-${(adjustedMonth + 1).toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
      return { 
        start: new Date(startDateStr + 'T00:00:00.000Z'),
        end: new Date(endDateStr + 'T23:59:59.999Z')
      };
    }
  };

  const handleSummaryCardClick = async (category: string) => {
    setSelectedCategory(category);
    if (attendanceData.length === 0) {
      await fetchAttendanceData();
    }
    setShowDetailModal(true);
  };

  if (!teacherData) {
    return <div>Loading...</div>;
  }

  return (
    <Container isDarkMode={isDarkMode} isRTL={isRTL}>
      <Header isDarkMode={isDarkMode}>
        <HeaderText>
          <Greeting isRTL={isRTL}>
            {t.greeting(teacherData.name)}
          </Greeting>
          <Subtitle isRTL={isRTL} isDarkMode={isDarkMode}>{t.subtitle}</Subtitle>
        </HeaderText>
        <ProfilePicture />
      </Header>

      <MainContent isDarkMode={isDarkMode}>
        <WorkTimeCard isDarkMode={isDarkMode}>
          <WorkTimeHeader isRTL={isRTL}>
            <WorkTimeTitle isDarkMode={isDarkMode}>{t.workTime}</WorkTimeTitle>
            <SendRequestButton 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => setShowSendRequestModal(true)}
            >
              {t.sendRequest}
            </SendRequestButton>
          </WorkTimeHeader>

          <TimerDisplay>
            <TimerText isDarkMode={isDarkMode}>
              {time}
            </TimerText>
            <DateText isDarkMode={isDarkMode} isRTL={isRTL}>
              {formattedDate}
            </DateText>
          </TimerDisplay>

          <ButtonContainer isRTL={isRTL}>
            <CheckOutButton 
              isDarkMode={isDarkMode}
              onClick={handleCheckOut}
              disabled={loading}
            >
              {t.checkOut}
            </CheckOutButton>
            <BreakButton 
              isDarkMode={isDarkMode}
              isOnBreak={isOnBreak}
              onClick={handleTakeBreak}
            >
              {isOnBreak ? t.resume : t.takeABreak}
            </BreakButton>
          </ButtonContainer>

          <AttendanceInfo isRTL={isRTL}>
            <AttendanceItem isDarkMode={isDarkMode} isRTL={isRTL}>
              <AttendanceTime isDarkMode={isDarkMode}>
                {formatAttendanceTime(checkInTime)}
              </AttendanceTime>
              <AttendanceLabel isDarkMode={isDarkMode}>
                {t.checkIn}
              </AttendanceLabel>
            </AttendanceItem>
            
            <AttendanceItem isDarkMode={isDarkMode} isRTL={isRTL}>
              <AttendanceTime isDarkMode={isDarkMode}>
                {formatAttendanceTime(checkOutTime)}
              </AttendanceTime>
              <AttendanceLabel isDarkMode={isDarkMode}>
                {t.checkOut}
              </AttendanceLabel>
            </AttendanceItem>
            
            <AttendanceItem isDarkMode={isDarkMode} isRTL={isRTL}>
              <AttendanceTime isDarkMode={isDarkMode}>
                {formatAttendanceTime(lateTime)}
              </AttendanceTime>
              <AttendanceLabel isDarkMode={isDarkMode}>
                {t.late}
              </AttendanceLabel>
            </AttendanceItem>
          </AttendanceInfo>
        </WorkTimeCard>

        <SummarySection isDarkMode={isDarkMode} isRTL={isRTL}>
          {latestNotification && showNotification && (
            <NotificationBanner 
              isDarkMode={isDarkMode} 
              isRTL={isRTL} 
              type={latestNotification.type}
              onClick={() => setShowNotification(false)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <NotificationIcon isRTL={isRTL}>{latestNotification.type === 'success' ? '✓' : '!'}</NotificationIcon>
                <NotificationText isRTL={isRTL}>
                  {isRTL ? latestNotification.messageAr : latestNotification.message}
                </NotificationText>
              </div>
              <span style={{ cursor: 'pointer', fontSize: '20px' }}>×</span>
            </NotificationBanner>
          )}
          
          <SummaryHeader isRTL={isRTL}>
            <SummaryTitle isDarkMode={isDarkMode} isRTL={isRTL}>{t.summary}</SummaryTitle>
            <FilterDropdown>
              <DropdownButton 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {filterPeriod} {isRTL ? '◄' : '▼'}
              </DropdownButton>
              <DropdownMenu isOpen={isDropdownOpen} isDarkMode={isDarkMode} isRTL={isRTL}>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.thisWeek)}>
                  {t.thisWeek}
                </DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.thisMonth)}>
                  {t.thisMonth}
                </DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.lastWeek)}>
                  {t.lastWeek}
                </DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.lastMonth)}>
                  {t.lastMonth}
                </DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.custom)}>
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
            >
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.allowedAbsence}
              </SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {loading ? '⏳' : (isRTL && summaryData.allowedAbsence === 0) ? `.. ${t.days}` : `${summaryData.allowedAbsence.toString().padStart(2, '0')} ${t.days}`}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => handleSummaryCardClick('unallowedAbsence')}
            >
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.unallowedAbsence}
              </SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {loading ? '⏳' : (isRTL && summaryData.unallowedAbsence === 0) ? `.. ${t.days}` : `${summaryData.unallowedAbsence.toString().padStart(2, '0')} ${t.days}`}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => handleSummaryCardClick('authorizedAbsence')}
            >
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.authorizedAbsence}
              </SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {loading ? '⏳' : (isRTL && summaryData.authorizedAbsence === 0) ? `.. ${t.days}` : `${summaryData.authorizedAbsence.toString().padStart(2, '0')} ${t.days}`}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => handleSummaryCardClick('unauthorizedAbsence')}
            >
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.unauthorizedAbsence}
              </SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {loading ? '⏳' : (isRTL && summaryData.unauthorizedAbsence === 0) ? `.. ${t.days}` : `${summaryData.unauthorizedAbsence.toString().padStart(2, '0')} ${t.days}`}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => handleSummaryCardClick('overtime')}
            >
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.overtime}
              </SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {loading ? '⏳' : (isRTL && summaryData.overtime === 0) ? `.. ${t.days}` : `${summaryData.overtime.toString().padStart(2, '0')} ${t.days}`}
              </SummaryValue>
            </SummaryItem>
            <SummaryItem 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => handleSummaryCardClick('lateArrival')}
            >
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.lateArrival}
              </SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {loading ? '⏳' : (isRTL && summaryData.lateArrival === 0) ? `.. ${t.days}` : `${summaryData.lateArrival.toString().padStart(2, '0')} ${t.days}`}
              </SummaryValue>
            </SummaryItem>
          </SummaryGrid>
        </SummarySection>
      </MainContent>

      {/* Date Picker Modal */}
      <DatePickerModal isOpen={isDatePickerOpen}>
        <DatePickerContent isDarkMode={isDarkMode} isRTL={isRTL}>
          <CalendarHeader isRTL={isRTL}>
            <NavButton isRTL={isRTL} onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}>
              ‹
            </NavButton>
            <MonthYear isDarkMode={isDarkMode} isRTL={isRTL}>
              {t.monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </MonthYear>
            <NavButton isRTL={isRTL} onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}>
              ›
            </NavButton>
          </CalendarHeader>

          <CalendarGrid>
            {renderCalendar()}
          </CalendarGrid>

          {dateRange.start && dateRange.end && (
            <DateRangeDisplay isDarkMode={isDarkMode} isRTL={isRTL}>
              {dateRange.start.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })} - {dateRange.end.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
            </DateRangeDisplay>
          )}

          <DoneButton 
            isDarkMode={isDarkMode}
            isRTL={isRTL}
            onClick={handleDateRangeConfirm}
            disabled={!dateRange.start || !dateRange.end}
            style={{ opacity: (!dateRange.start || !dateRange.end) ? 0.5 : 1 }}
          >
            {t.done}
          </DoneButton>
        </DatePickerContent>
      </DatePickerModal>

      <BottomNavigation isDarkMode={isDarkMode}>
        <NavItem isDarkMode={isDarkMode} isActive onClick={() => handleNavigation('home')}>
          <NavIcon>🏠</NavIcon>
          <NavLabel isRTL={isRTL}>{t.home}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} onClick={() => handleNavigation('history')}>
          <NavIcon>📋</NavIcon>
          <NavLabel isRTL={isRTL}>{t.history}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} onClick={() => handleNavigation('notifications')}>
          <NavIcon>🔔</NavIcon>
          <NavLabel isRTL={isRTL}>{t.notifications}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} onClick={() => handleNavigation('profile')}>
          <NavIcon>👤</NavIcon>
          <NavLabel isRTL={isRTL}>{t.profile}</NavLabel>
        </NavItem>
      </BottomNavigation>

      {showCheckoutModal && (
        <CheckOutConfirmationModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={handleConfirmCheckOut}
          loading={loading}
          isEarlyCheckout={isEarlyCheckout}
          hoursWorked={hoursWorked}
        />
      )}

      {showSendRequestModal && (
        <SendRequestModal
          isOpen={showSendRequestModal}
          onClose={() => setShowSendRequestModal(false)}
          teacherData={teacherData}
          onRequestSubmitted={() => {
            setShowSendRequestModal(false);
            // Optionally refresh attendance data here if needed
          }}
        />
      )}

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

export default TeacherTimerPage; 