import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import LocationDetectionModal from '../components/LocationDetectionModal';
import CheckOutConfirmationModal from '../components/CheckOutConfirmationModal';
import SendRequestModal from '../components/SendRequestModal';
import SummaryDetailModal from '../components/SummaryDetailModal';

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
  padding: 60px 20px 30px 20px;
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
  color: ${props => props.isDarkMode ? '#ccc' : 'white'};
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
  background: ${props => props.isDarkMode ? '#121212' : '#f5f5f5'};
  border-radius: 25px 25px 0 0;
  min-height: calc(100vh - 150px);
  padding: 0;
  position: relative;
`;

const WorkTimeCard = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  margin: 20px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 10px rgba(0, 0, 0, 0.5)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)'
  };
  position: relative;
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
`;

const WorkTimeHeader = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const WorkTimeTitle = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;



const SendRequestButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: none;
  border: none;
  color: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
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

const TimerControls = styled.div<{ isRTL: boolean }>`
  display: flex;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const TimerButton = styled.button<{ isDarkMode: boolean; isRTL: boolean; variant: 'primary' | 'secondary' }>`
  background: ${props => props.variant === 'primary' ? '#DAA520' : 'transparent'};
  color: ${props => props.variant === 'primary' ? 'white' : '#DAA520'};
  border: ${props => props.variant === 'primary' ? 'none' : '2px solid #DAA520'};
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  min-width: 120px;

  &:hover {
    background: ${props => props.variant === 'primary' ? '#B8860B' : '#DAA520'};
    color: white;
    transform: translateY(-1px);
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

const TimerDisplay = styled.div`
  text-align: center;
  margin: 30px 0;
`;

const TimeText = styled.div<{ isDarkMode: boolean }>`
  font-size: 48px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  letter-spacing: 2px;
`;

const DateText = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 16px;
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  margin: 10px 0 30px 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const PlayButton = styled.button<{ isDarkMode: boolean }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
    : 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
  };
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 30px auto;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 20px rgba(218, 165, 32, 0.3);
  font-size: 24px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 25px rgba(218, 165, 32, 0.4);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const PlayIcon = styled.div`
  width: 0;
  height: 0;
  border-left: 25px solid white;
  border-top: 15px solid transparent;
  border-bottom: 15px solid transparent;
  margin-left: 8px;
`;

const MotivationText = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  font-size: 16px;
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const SummarySection = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  margin: 20px;
  border-radius: 20px;
  padding: 24px;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 10px rgba(0, 0, 0, 0.5)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
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
  background: ${props => props.isDarkMode ? '#333' : '#f0f0f0'};
  border: none;
  padding: 10px 16px;
  border-radius: 12px;
  font-size: 14px;
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: ${props => props.isDarkMode ? '#444' : '#e8e8e8'};
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean; isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  top: 100%;
  ${props => props.isRTL ? 'left' : 'right'}: 0;
  background: ${props => props.isDarkMode ? '#2d2d2d' : 'white'};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 8px 0;
  min-width: 150px;
  z-index: 1000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: translateY(${props => props.isOpen ? '8px' : '0'});
  transition: all 0.2s;
  border: ${props => props.isDarkMode ? '1px solid #444' : 'none'};
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
    background: ${props => props.isDarkMode ? '#333' : '#f5f5f5'};
  }
`;

const SummaryGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SummaryItem = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#FFF8DC'};
  padding: 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: ${props => props.isRTL ? 'none' : '4px solid #DAA520'};
  border-right: ${props => props.isRTL ? '4px solid #DAA520' : 'none'};
  border: ${props => props.isDarkMode ? '1px solid #444' : props.isRTL ? '1px solid #DAA520' : '1px solid transparent'};
  border-right-width: ${props => props.isRTL ? '4px' : '1px'};
  border-left-width: ${props => props.isRTL ? '1px' : '4px'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.isDarkMode ? '#333' : '#F5F5DC'};
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
  color: ${props => props.isDarkMode ? '#DAA520' : '#333'};
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
  cursor: pointer;
  
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

// School Hours Modal styles
const SchoolHoursModal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  z-index: 1001;
`;

const SchoolHoursModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const SchoolHoursIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
`;

const SchoolHoursMessage = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2c3e50'};
  font-size: 16px;
  font-family: ${props => props.isRTL ? "'Noto Sans Arabic', sans-serif" : "'Poppins', sans-serif"};
  margin-bottom: 24px;
  line-height: 1.5;
`;

const SchoolHoursButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
  color: white;
  border: none;
  padding: 12px 32px;
  border-radius: 8px;
  font-size: 16px;
  font-family: ${props => props.isRTL ? "'Noto Sans Arabic', sans-serif" : "'Poppins', sans-serif"};
  cursor: pointer;
  transition: background 0.3s ease;
  
  &:hover {
    background: #B8860B;
  }
`;

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
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  border-radius: 20px;
  padding: 24px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
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
    props.isDarkMode ? '#1e1e1e' : 'transparent'
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
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#FFF8DC'};
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

const BottomNavigation = styled.div<{ isDarkMode: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  padding: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid ${props => props.isDarkMode ? '#333' : '#e0e0e0'};
  z-index: 100;
`;

const NavItem = styled.button<{ active?: boolean; isDarkMode: boolean; isRTL: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${props => 
    props.active ? '#DAA520' : 
    props.isDarkMode ? '#999' : '#999'
  };
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

// Types
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

const TeacherHomeAdvanced: React.FC = () => {
  const navigate = useNavigate();
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  const [time, setTime] = useState('00:00:00');
  const [isRunning, setIsRunning] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('This month');
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
  const [teacherData, setTeacherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [showSendRequestModal, setShowSendRequestModal] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [checkInTime] = useState<string>('');
  const [checkOutTime] = useState<string>('');
  const [lateTime] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(true);
  const [showSchoolHoursNotification, setShowSchoolHoursNotification] = useState(false);

  // Get current date info
  const today = new Date();
  const formattedDate = t.formatDate(today);

  // Load teacher data on mount
  useEffect(() => {
    const storedTeacherData = localStorage.getItem('teacherData');
    if (storedTeacherData) {
      setTeacherData(JSON.parse(storedTeacherData));
    } else {
      navigate('/teacher/signin');
    }
  }, [navigate]);

  // Update filter period with correct translation when language changes
  useEffect(() => {
    setFilterPeriod(t.thisMonth);
  }, [t.thisMonth]);

  // Check if teacher is already checked in when component loads
  useEffect(() => {
    const checkCurrentStatus = async () => {
      if (!teacherData) return;

      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`http://localhost:5000/api/attendance?teacherId=${teacherData.id}&startDate=${today}&endDate=${today}`);
        const data = await response.json();

        if (data.success && data.data && data.data.length > 0) {
          const todayRecord = data.data[0];
          // If teacher checked in but not checked out, they are currently running
          if (todayRecord.checkIn && !todayRecord.currentSessionCheckOut) {
            console.log('Teacher is already checked in, setting isRunning to true');
            setIsRunning(true);
          }
        }
      } catch (error) {
        console.error('Error checking current status:', error);
      }
    };

    checkCurrentStatus();
  }, [teacherData]);

  // Fetch attendance summary when teacher data or filter period changes
  useEffect(() => {
    if (teacherData) {
      fetchAttendanceSummary();
    }
  }, [teacherData, filterPeriod]);

  // Refresh attendance summary when page gains focus (user returns from other pages)
  useEffect(() => {
    const handleFocus = () => {
      if (teacherData) {
        fetchAttendanceSummary();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [teacherData]);

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
    if (isRunning && !isOnBreak) {
      interval = setInterval(() => {
        setTime(prevTime => {
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
  }, [isRunning, isOnBreak]);

  // Helper function to format summary values
  const formatSummaryValue = (value: number | undefined) => {
    if (loading) return '⏳';
    if (value === undefined || value === null) return '-- ' + t.days;
    
    // In Arabic, show ".." for zero values, otherwise show padded number
    if (isRTL && value === 0) {
      return `.. ${t.days}`;
    }
    
    // For non-zero or English, show padded number
    return `${value.toString().padStart(2, '0')} ${t.days}`;
  };

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

  // Fetch attendance summary from backend
  const fetchAttendanceSummary = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      
      // Map display period to API period (backend only understands English)
      const mapPeriodToAPI = (displayPeriod: string) => {
        if (displayPeriod === t.thisWeek || displayPeriod === 'This week') return 'This week';
        if (displayPeriod === t.thisMonth || displayPeriod === 'This month') return 'This month';
        if (displayPeriod === t.lastWeek || displayPeriod === 'Last week') return 'Last week';
        if (displayPeriod === t.lastMonth || displayPeriod === 'Last month') return 'Last month';
        if (displayPeriod.startsWith(t.custom) || displayPeriod.startsWith('Custom')) return 'Custom';
        return displayPeriod; // fallback
      };
      
      const apiPeriod = mapPeriodToAPI(filterPeriod);
      const queryParams = new URLSearchParams({
        period: apiPeriod
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

      const response = await fetch(`http://localhost:5000/api/attendance/summary/${teacherData.id}?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setSummaryData(data.data);
      }

      // Also fetch latest balance information
      const balanceResponse = await fetch(`http://localhost:5000/api/teachers/${teacherData.id}/balance`);
      if (balanceResponse.ok) {
        const balanceData = await balanceResponse.json();
        if (balanceData.success) {
          // Update teacher data with latest balance
          const updatedTeacherData = {
            ...teacherData,
            remainingLateEarlyHours: balanceData.balance.remainingLateEarlyHours,
            totalLateEarlyHours: balanceData.balance.totalLateEarlyHours,
            allowedAbsenceDays: balanceData.balance.allowedAbsenceDays,
            totalAbsenceDays: balanceData.balance.totalAbsenceDays,
            remainingAbsenceDays: balanceData.balance.remainingAbsenceDays
          };
          setTeacherData(updatedTeacherData);
          localStorage.setItem('teacherData', JSON.stringify(updatedTeacherData));
        }
      }
    } catch (error) {
      console.error('Error fetching attendance summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayPause = async () => {
    if (!teacherData) return;

    if (isRunning) {
      // If already running, navigate to timer page to continue the session
      console.log('Teacher is already running, navigating to timer page');
      navigate('/teacher/timer', {
        state: {
          time: '00:00:00',
          checkInTime: '04:19 PM', // This will be calculated correctly in timer page
          lateTime: '08:19:00',
          isResuming: true
        }
      });
    } else {
      // Check if current time is before 8:00 AM
      const now = new Date();
      const currentHour = now.getHours();
      
      if (currentHour < 8) {
        // Show notification that school is not open yet
        setShowSchoolHoursNotification(true);
        return;
      }
      
      // If not running, this is a checkin - show location modal first
      setShowLocationModal(true);
    }
  };

  const handleLocationVerified = async () => {
    if (!teacherData) return;

    try {
      setLoading(true);
      console.log('Location verified, starting check-in process...');
      
      const response = await fetch(`http://localhost:5000/api/attendance/checkin/${teacherData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'checkin',
          teacherName: teacherData.name,
          subject: teacherData.subject,
          workType: teacherData.workType || 'Full-time',
          isOvertimeSession: true // Mark as overtime since location was verified
        }),
      });

      const data = await response.json();
      console.log('Check-in API response:', data);

      if (data.success) {
        const now = new Date();
        const checkInTimeStr = now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
        
        // Calculate late time if checked in after 8:00 AM
        const eightAM = new Date();
        eightAM.setHours(8, 0, 0, 0);
        
        let lateTimeStr = '';
        if (now > eightAM) {
          const lateDiff = now.getTime() - eightAM.getTime();
          const lateHours = Math.floor(lateDiff / (1000 * 60 * 60));
          const lateMinutes = Math.floor((lateDiff % (1000 * 60 * 60)) / (1000 * 60));
          lateTimeStr = `${lateHours.toString().padStart(2, '0')}:${lateMinutes.toString().padStart(2, '0')}:32`;
        }
        
        // Refresh attendance summary with latest data
        await fetchAttendanceSummary();
        
        console.log('Navigating to timer page with data:', {
          time: '00:00:00',
          checkInTime: checkInTimeStr,
          lateTime: lateTimeStr
        });
        
        // Navigate to timer page with initial data
        navigate('/teacher/timer', {
          state: {
            time: '00:00:00',
            checkInTime: checkInTimeStr,
            lateTime: lateTimeStr
          }
        });
      } else if (data.message && (data.message.includes('Already checked in') || data.message.includes('current session'))) {
        console.log('Already checked in, navigating to timer with current session data');
        
        // Teacher is already checked in - navigate to timer page to continue working
        navigate('/teacher/timer', {
          state: {
            time: '00:00:00',
            checkInTime: '04:19 PM', // Use actual check-in time if available
            lateTime: '08:19:00',    // Use actual late time if available
            isResuming: true         // Flag to indicate this is resuming a session
          }
        });
      } else {
        console.error('Check-in failed:', data.message);
        alert('Check-in failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error with check-in:', error);
      alert('Check-in error: ' + (error as Error).message);
    } finally {
      setLoading(false);
      setShowLocationModal(false);
    }
  };

  const handleTakeBreak = () => {
    setIsOnBreak(!isOnBreak);
  };

  const handleCheckOut = () => {
    setShowCheckoutModal(true);
  };

  const confirmCheckOut = async () => {
    if (!teacherData || loading) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/attendance/checkin/${teacherData.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'checkout',
          teacherName: teacherData.name,
          subject: teacherData.subject,
          workType: teacherData.workType || 'Full-time'
        }),
      });

      const data = await response.json();

      if (data.success) {
        setIsRunning(false);
        setIsOnBreak(false);
        setTime('00:00:00');
        await fetchAttendanceSummary();
        
        // Close the modal
        setShowCheckoutModal(false);
        
        // Clear teacher data and navigate to role selection
        localStorage.removeItem('teacherData');
        navigate('/');
      } else {
        console.error('Checkout failed:', data.message);
        // Close modal even on failure to prevent it from being stuck
        setShowCheckoutModal(false);
      }
    } catch (error) {
      console.error('Error with checkout:', error);
      // Close modal on error to prevent it from being stuck
      setShowCheckoutModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (period: string) => {
    if (period === t.custom) {
      setIsDatePickerOpen(true);
    } else {
      setFilterPeriod(period);
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

  const handleLogout = () => {
    localStorage.removeItem('teacherToken');
    navigate('/');
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

  const handleNavigation = (route: string) => {
    switch (route) {
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

  return (
    <Container isDarkMode={isDarkMode} isRTL={isRTL}>
      <Header isDarkMode={isDarkMode}>
        <HeaderText>
          <Greeting isRTL={isRTL}>{t.greeting(teacherData?.name || 'محمود')}</Greeting>
          <Subtitle isRTL={isRTL} isDarkMode={isDarkMode}>{t.subtitle}</Subtitle>
        </HeaderText>
        <ProfileImage />
      </Header>

      <MainContent isDarkMode={isDarkMode}>
        <WorkTimeCard isDarkMode={isDarkMode} isRTL={isRTL}>
          <WorkTimeHeader isRTL={isRTL}>
            <WorkTimeTitle isDarkMode={isDarkMode} isRTL={isRTL}>{t.workTime}</WorkTimeTitle>
            <SendRequestButton 
              isDarkMode={isDarkMode} 
              isRTL={isRTL}
              onClick={() => setShowSendRequestModal(true)}
            >
              {t.sendRequest}
            </SendRequestButton>
          </WorkTimeHeader>

          <TimerDisplay>
            <TimeText isDarkMode={isDarkMode}>{time}</TimeText>
            <DateText isDarkMode={isDarkMode} isRTL={isRTL}>{formattedDate}</DateText>
            {!isRunning ? (
              <PlayButton isDarkMode={isDarkMode} onClick={handlePlayPause} disabled={loading}>
                {loading ? '⏳' : <PlayIcon />}
              </PlayButton>
            ) : (
              <TimerControls isRTL={isRTL}>
                <TimerButton 
                  isDarkMode={isDarkMode} 
                  isRTL={isRTL} 
                  variant="secondary"
                  onClick={handleCheckOut}
                >
                  {t.checkOut}
                </TimerButton>
                <TimerButton 
                  isDarkMode={isDarkMode} 
                  isRTL={isRTL} 
                  variant="primary"
                  onClick={handleTakeBreak}
                >
                  {isOnBreak ? t.resume : t.takeABreak}
                </TimerButton>
              </TimerControls>
            )}
            
            {isRunning && (
              <AttendanceInfo isRTL={isRTL}>
                <AttendanceItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <AttendanceTime isDarkMode={isDarkMode}>
                    {formatAttendanceTime(checkInTime || '04:50 AM')}
                  </AttendanceTime>
                  <AttendanceLabel isDarkMode={isDarkMode}>
                    {t.checkIn}
                  </AttendanceLabel>
                </AttendanceItem>
                
                <AttendanceItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <AttendanceTime isDarkMode={isDarkMode}>
                    {formatAttendanceTime(checkOutTime || '12:50 PM')}
                  </AttendanceTime>
                  <AttendanceLabel isDarkMode={isDarkMode}>
                    {t.checkOut}
                  </AttendanceLabel>
                </AttendanceItem>
                
                <AttendanceItem isDarkMode={isDarkMode} isRTL={isRTL}>
                  <AttendanceTime isDarkMode={isDarkMode}>
                    {lateTime || '00:00:00'}
                  </AttendanceTime>
                  <AttendanceLabel isDarkMode={isDarkMode}>
                    {t.late}
                  </AttendanceLabel>
                </AttendanceItem>
              </AttendanceInfo>
            )}
            
            {!isRunning && (
              <MotivationText isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.motivationText}
              </MotivationText>
            )}
          </TimerDisplay>
        </WorkTimeCard>

        <SummarySection isDarkMode={isDarkMode}>
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
              <DropdownButton isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
                {filterPeriod} ▼
              </DropdownButton>
              <DropdownMenu isOpen={isDropdownOpen} isDarkMode={isDarkMode} isRTL={isRTL}>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.thisWeek)}>{t.thisWeek}</DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.thisMonth)}>{t.thisMonth}</DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.lastWeek)}>{t.lastWeek}</DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.lastMonth)}>{t.lastMonth}</DropdownItem>
                <DropdownItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleFilterChange(t.custom)}>{t.custom}</DropdownItem>
              </DropdownMenu>
            </FilterDropdown>
          </SummaryHeader>

          <SummaryGrid>
                          <SummaryItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleSummaryCardClick('allowedAbsence')}>
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>{t.allowedAbsence}</SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>{formatSummaryValue(summaryData.allowedAbsence)}</SummaryValue>
              </SummaryItem>
              <SummaryItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleSummaryCardClick('unallowedAbsence')}>
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>{t.unallowedAbsence}</SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>{formatSummaryValue(summaryData.unallowedAbsence)}</SummaryValue>
              </SummaryItem>
            <SummaryItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleSummaryCardClick('authorizedAbsence')}>
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>{t.authorizedAbsence}</SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>{formatSummaryValue(summaryData.authorizedAbsence)}</SummaryValue>
            </SummaryItem>
            <SummaryItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleSummaryCardClick('unauthorizedAbsence')}>
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>{t.unauthorizedAbsence}</SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>{formatSummaryValue(summaryData.unauthorizedAbsence)}</SummaryValue>
            </SummaryItem>
            <SummaryItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleSummaryCardClick('overtime')}>
              <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>{t.overtime}</SummaryLabel>
              <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>{formatSummaryValue(summaryData.overtime)}</SummaryValue>
            </SummaryItem>
                          <SummaryItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleSummaryCardClick('lateArrival')}>
                <SummaryLabel isDarkMode={isDarkMode} isRTL={isRTL}>{t.lateArrival}</SummaryLabel>
                <SummaryValue isDarkMode={isDarkMode} isRTL={isRTL}>{formatSummaryValue(summaryData.lateArrival)}</SummaryValue>
            </SummaryItem>
          </SummaryGrid>
        </SummarySection>

        <div style={{ height: '100px' }} />
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

      {/* Bottom Navigation */}
      <BottomNavigation isDarkMode={isDarkMode}>
        <NavItem active isDarkMode={isDarkMode} isRTL={isRTL}>
          <NavIcon>🏠</NavIcon>
          <NavLabel>{t.home}</NavLabel>
        </NavItem>
        <NavItem isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => handleNavigation('history')}>
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

      {/* Location Detection Modal */}
      <LocationDetectionModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onLocationVerified={handleLocationVerified}
        teacherData={teacherData}
      />

      {/* Check Out Confirmation Modal */}
      <CheckOutConfirmationModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        onConfirm={confirmCheckOut}
        loading={loading}
      />

      {/* Send Request Modal */}
      <SendRequestModal
        isOpen={showSendRequestModal}
        onClose={() => setShowSendRequestModal(false)}
        teacherData={teacherData}
        onRequestSubmitted={() => {
          // Optionally refresh data or show success message
          console.log('Request submitted successfully');
        }}
      />

      {/* Summary Detail Modal */}
      <SummaryDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        category={selectedCategory}
        data={attendanceData}
        dateRange={getCurrentDateRange()}
        filter={filterPeriod}
      />

      {/* School Hours Notification Modal */}
      <SchoolHoursModal isOpen={showSchoolHoursNotification}>
        <SchoolHoursModalContent isDarkMode={isDarkMode} isRTL={isRTL}>
          <SchoolHoursIcon>🕐</SchoolHoursIcon>
          <SchoolHoursMessage isDarkMode={isDarkMode} isRTL={isRTL}>
            {t.schoolNotOpenYet}
          </SchoolHoursMessage>
          <SchoolHoursButton 
            isDarkMode={isDarkMode} 
            isRTL={isRTL}
            onClick={() => setShowSchoolHoursNotification(false)}
          >
            {isRTL ? 'حسناً' : 'OK'}
          </SchoolHoursButton>
        </SchoolHoursModalContent>
      </SchoolHoursModal>
    </Container>
  );
};

export default TeacherHomeAdvanced; 