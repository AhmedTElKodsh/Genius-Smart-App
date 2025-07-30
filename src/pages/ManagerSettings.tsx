import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import Sidebar from '../components/Sidebar';
import AddTeacherModal from '../components/AddTeacherModal';
import HolidayModal from '../components/HolidayModal';
import { useLanguage } from '../contexts/LanguageContext';

// Styled components
const SettingsContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #E7E7E7;
`;

const MainContent = styled.main<{ $isRTL: boolean }>`
  flex: 1;
  margin-left: ${props => props.$isRTL ? '0' : '240px'};
  margin-right: ${props => props.$isRTL ? '240px' : '0'};
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const LogoIcon = styled.div`
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &::before {
    content: '👑';
    font-size: 24px;
  }
`;

const LogoText = styled.div`
  h1 {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    font-weight: 700;
    color: #333;
    margin: 0;
  }
  
  p {
    font-family: 'Poppins', sans-serif;
    font-size: 14px;
    color: #666;
    margin: 0;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$active ? `
    background: #D4AF37;
    color: white;
  ` : `
    background: white;
    color: #666;
    
    &:hover {
      background: #f5f5f5;
    }
  `}
`;

const FormContainer = styled.div<{ $isRTL?: boolean }>`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const FormHeader = styled.div<{ $isRTL?: boolean }>`
  margin-bottom: 32px;
  text-align: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const FormTitle = styled.h2<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const FormSubtitle = styled.p<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const Form = styled.form`
  display: grid;
  gap: 24px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const Input = styled.input`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
  
  &::placeholder {
    color: #999;
  }
`;

const Select = styled.select`
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  background: white;
  color: #141F25;
  cursor: pointer;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
  
  option {
    color: #141F25;
    background: #ffffff;
  }
`;

const ImageUploadContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  background: #fafafa;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #D4AF37;
  }
`;

const ProfileImage = styled.div<{ $imageUrl?: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$imageUrl ? `url(${props.$imageUrl})` : '#e0e0e0'};
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  
  ${props => !props.$imageUrl && `
    &::before {
      content: '👤';
      font-size: 48px;
      color: #999;
    }
  `}
`;

const ImageUploadButton = styled.button`
  padding: 12px 24px;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #B8941F;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const DateOfBirthContainer = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: auto 1fr 1fr 1fr;
  gap: 16px;
  align-items: end;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const DateSelect = styled(Select)`
  min-width: 200px;
`;

const SaveButton = styled.button`
  grid-column: 1 / -1;
  justify-self: end;
  padding: 16px 48px;
  background: #D4AF37;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #B8941F;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #fee;
  border-radius: 4px;
  border: 1px solid #fcc;
`;

const SuccessMessage = styled.div`
  color: #28a745;
  font-size: 14px;
  margin-top: 16px;
  padding: 12px;
  background: #efe;
  border-radius: 4px;
  border: 1px solid #cfc;
`;

const SuccessModal = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  display: ${props => props.$show ? 'block' : 'none'};
  text-align: center;
  min-width: 400px;
  
  .success-icon {
    font-size: 64px;
    color: #4caf50;
    margin-bottom: 20px;
  }
  
  h3 {
    font-family: 'Poppins', sans-serif;
    font-size: 24px;
    color: #333;
    margin-bottom: 10px;
  }
  
  p {
    font-family: 'Poppins', sans-serif;
    font-size: 16px;
    color: #666;
    margin-bottom: 20px;
    line-height: 1.5;
  }
  
  button {
    background: #D4AF37;
    color: white;
    border: none;
    padding: 12px 30px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: #B8941F;
    }
  }
`;

const ModalOverlay = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: ${props => props.$show ? 'block' : 'none'};
`;

const HelperText = styled.p<{ $isRTL?: boolean }>`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const NotificationContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const NotificationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  transition: border-color 0.2s ease;
  
  &:hover {
    border-color: #D4AF37;
  }
`;

const NotificationLabel = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #333;
`;

const ToggleSwitch = styled.div<{ $active: boolean }>`
  width: 60px;
  height: 30px;
  border-radius: 15px;
  background: ${props => props.$active ? '#D4AF37' : '#e0e0e0'};
  position: relative;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &::after {
    content: '';
    position: absolute;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: white;
    top: 2px;
    left: ${props => props.$active ? '32px' : '2px'};
    transition: left 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

const PasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 500px;
  margin: 0 auto;
`;

const PasswordInput = styled(Input)`
  &:focus {
    border-color: #D4AF37;
  }
`;

const TestButton = styled.button`
  padding: 8px 16px;
  background: #f0f0f0;
  color: #666;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e0e0e0;
    color: #333;
  }
`;

const TestSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background: #f9f9f9;
`;

const TestSectionTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const TestButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

// Holiday Management Styled Components
const HolidayManagementSection = styled.div`
  margin-top: 24px;
`;

const HolidayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h3 {
    font-family: 'Poppins', sans-serif;
    font-size: 18px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
`;

const AddHolidayButton = styled.button`
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(212, 175, 55, 0.3);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  
  p {
    font-family: 'Poppins', sans-serif;
    color: #666;
    margin: 8px 0;
    
    &:first-child {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
  }
`;

const HolidayList = styled.div`
  display: grid;
  gap: 16px;
`;

const HolidayCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: #D4AF37;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const HolidayInfo = styled.div`
  flex: 1;
`;

const HolidayName = styled.h4`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
`;

const HolidayDate = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #D4AF37;
  font-weight: 500;
  margin: 0 0 8px 0;
`;

const HolidayDescription = styled.p`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0 0 8px 0;
`;

const RecurringBadge = styled.span`
  background: #E8F5E8;
  color: #2E7D2E;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
`;

const HolidayActions = styled.div`
  display: flex;
  gap: 8px;
`;

const EditButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #45a049;
  }
`;

const DeleteButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #da190b;
  }
`;

// New styled components for General tab
const WeekendSection = styled.div<{ $isRTL: boolean }>`
  margin-bottom: 32px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const WeekendDays = styled.div<{ $isRTL: boolean }>`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const DayCheckbox = styled.label<{ $isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  min-width: 140px;
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #333;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  justify-content: center;
  
  &:hover {
    border-color: #D4AF37;
  }
  
  &.selected {
    border-color: #D4AF37;
    background: #FFF8E8;
  }
  
  input[type="checkbox"] {
    accent-color: #D4AF37;
    transform: scale(1.2);
  }
`;

const CalendarSection = styled.div<{ $isRTL: boolean }>`
  margin-bottom: 32px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const CalendarWrapper = styled.div<{ $isRTL: boolean }>`
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-top: 16px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const SelectedHolidaysSection = styled.div<{ $isRTL: boolean }>`
  margin-top: 20px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const HolidayTagsContainer = styled.div<{ $isRTL: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const HolidayTag = styled.div<{ $isRTL: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 24px;
  min-width: 220px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  &:hover {
    border-color: #D4AF37;
    background: #FFFBF0;
    box-shadow: 0 4px 12px rgba(212, 175, 55, 0.15);
  }
  
  .date-text {
    flex: 1;
  }
  
  .remove-btn {
    cursor: pointer;
    color: #999;
    font-size: 20px;
    font-weight: normal;
    line-height: 1;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
      background: #ffebee;
      color: #f44336;
    }
  }
`;

// Holiday Calendar component
const HolidayCalendar = styled.div<{ $isRTL: boolean }>`
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
    
    h3 {
      font-family: 'Poppins', sans-serif;
      font-size: 16px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .nav-buttons {
      display: flex;
      gap: 8px;
      
      button {
        background: white;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        padding: 6px 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        
        &:hover {
          border-color: #D4AF37;
          background: #FFF8E8;
        }
      }
    }
  }
  
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
    
    .day-header {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #666;
      padding: 8px;
    }
    
    .day-cell {
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s ease;
      background: white;
      
      &:hover:not(.disabled):not(.selected) {
        background: #f5f5f5;
        border-color: #D4AF37;
      }
      
      &.selected {
        background: #D4AF37;
        color: white;
        border-color: #D4AF37;
      }
      
      &.today {
        font-weight: bold;
        border-color: #333;
      }
      
      &.disabled {
        color: #ccc;
        cursor: not-allowed;
        background: #f9f9f9;
      }
      
      &.other-month {
        color: #999;
      }
    }
  }
`;

// Interfaces - removed unused ManagerProfile interface

interface NotificationPreferences {
  allNotifications: boolean;
  earlyArrival: boolean;
  lateArrival: boolean;
  earlyLeaves: boolean;
  lateLeaves: boolean;
  absentsTeachers: boolean;
  dailyReports: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
  yearlyReports: boolean;
}

// Holiday Calendar Component
interface HolidayCalendarComponentProps {
  currentMonth: Date;
  selectedDates: Date[];
  onDateClick: (date: Date) => void;
  onMonthChange: (date: Date) => void;
  isRTL: boolean;
}

const HolidayCalendarComponent: React.FC<HolidayCalendarComponentProps> = ({
  currentMonth,
  selectedDates,
  onDateClick,
  onMonthChange,
  isRTL
}) => {
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };
  
  const isDateSelected = (date: Date | null) => {
    if (!date) return false;
    return selectedDates.some(d => 
      d.getFullYear() === date.getFullYear() &&
      d.getMonth() === date.getMonth() &&
      d.getDate() === date.getDate()
    );
  };
  
  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate();
  };
  
  const monthNames = isRTL ? [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ] : [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // For RTL, reverse the day headers to show Saturday first
  const dayHeaders = isRTL ? ['س', 'ج', 'خ', 'ر', 'ث', 'ن', 'ح'] : ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const days = getDaysInMonth(currentMonth);
  
  return (
    <HolidayCalendar $isRTL={isRTL}>
      <div className="calendar-header">
        <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
        <div className="nav-buttons">
          <button type="button" onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            {isRTL ? '›' : '‹'}
          </button>
          <button type="button" onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            {isRTL ? '‹' : '›'}
          </button>
        </div>
      </div>
      
      <div className="calendar-grid">
        {dayHeaders.map((day, index) => (
          <div key={index} className="day-header">{day}</div>
        ))}
        
        {days.map((date, index) => (
          <div
            key={index}
            className={`day-cell ${!date ? 'empty' : ''} ${isDateSelected(date) ? 'selected' : ''} ${isToday(date) ? 'today' : ''}`}
            onClick={() => date && onDateClick(date)}
          >
            {date ? date.getDate() : ''}
          </div>
        ))}
      </div>
    </HolidayCalendar>
  );
};

const Settings: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t, language, setLanguage, isRTL } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('personalInfo');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profileImage, setProfileImage] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');
  const [holidays, setHolidays] = useState<any[]>([]);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<any>(null);
  
  // Password visibility states - removed unused state setters
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: {
      day: '',
      month: '',
      year: ''
    }
  });
  
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    allNotifications: true,
    earlyArrival: true,
    lateArrival: true,
    earlyLeaves: true,
    lateLeaves: true,
    absentsTeachers: true,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true,
    yearlyReports: true
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // State for General tab (weekends & holidays)
  const [weekendDays, setWeekendDays] = useState<string[]>(['Friday', 'Saturday']);
  const [selectedHolidays, setSelectedHolidays] = useState<Date[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Load manager profile on component mount
  useEffect(() => {
    loadManagerProfile();
    fetchCurrentUserRole();
    if (activeTab === 'notifications') {
      loadNotificationPreferences();
    }
    if (activeTab === 'holidays') {
      loadHolidays();
    }
    if (activeTab === 'general') {
      loadSystemSettings();
    }
  }, [activeTab]);

  const loadManagerProfile = async () => {
    try {
      let token = localStorage.getItem('authToken');
      
      // For demo purposes, create a default token if none exists
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const profile = data.data;
        
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || '',
          phone: profile.phone || '',
          address: profile.address || '',
          dateOfBirth: profile.dateOfBirth || { day: '', month: '', year: '' }
        });
        
        if (profile.profileImage) {
          setProfileImage(profile.profileImage);
        }
      } else {
        setError('Failed to load profile information');
      }
    } catch (err) {
      setError('Error loading profile information');
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.data);
      } else {
        setError('Failed to load notification preferences');
      }
    } catch (err) {
      setError('Error loading notification preferences');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('dateOfBirth.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        dateOfBirth: {
          ...prev.dateOfBirth,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let token = localStorage.getItem('authToken');
      
      // For demo purposes, create a default token if none exists
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const updateData = {
        ...formData,
        profileImage: profileImage || undefined
      };

      const response = await fetch('http://localhost:5000/api/manager/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        
        // If email was changed, update localStorage
        if (formData.email) {
          // You might want to handle email change specially
          // For now, just show success
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (key: keyof NotificationPreferences) => {
    try {
      const updatedNotifications = {
        ...notifications,
        [key]: !notifications[key]
      };

      // If turning off "All Notifications", turn off all others
      if (key === 'allNotifications' && !notifications.allNotifications) {
        Object.keys(updatedNotifications).forEach(k => {
          if (k !== 'allNotifications') {
            updatedNotifications[k as keyof NotificationPreferences] = false;
          }
        });
      }

      // If turning on any specific notification, ensure "All Notifications" is on
      if (key !== 'allNotifications' && !notifications[key]) {
        updatedNotifications.allNotifications = true;
      }

      setNotifications(updatedNotifications);

      // Save to backend
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/notifications', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedNotifications),
      });

      if (response.ok) {
        setSuccess('Notification preferences updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update notification preferences');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error updating notification preferences');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passwordData),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to change password');
      }
    } catch (err) {
      setError('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async (requestType: string) => {
    try {
      let token = localStorage.getItem('authToken');
      
      if (!token) {
        token = 'demo-manager-token-12345';
        localStorage.setItem('authToken', token);
      }

      const response = await fetch('http://localhost:5000/api/manager/test-notification', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestType }),
      });

      if (response.ok) {
        setSuccess(`Test ${requestType} notification sent! Check console for details.`);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Failed to send test notification');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      setError('Error sending test notification');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Fetch current user role
  const fetchCurrentUserRole = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/teachers/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setCurrentUserRole(userData.role || '');
      }
    } catch (error) {
      console.error('Error fetching current user role:', error);
    }
  };

  // Load holidays
  const loadHolidays = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/holidays', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setHolidays(data.data || []);
      }
    } catch (error) {
      console.error('Error loading holidays:', error);
    }
  };

  // Add or update holiday
  const saveHoliday = async (holidayData: any) => {
    try {
      const token = localStorage.getItem('authToken');
      const url = editingHoliday 
        ? `http://localhost:5000/api/holidays/${editingHoliday.id}`
        : 'http://localhost:5000/api/holidays';
      const method = editingHoliday ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(holidayData)
      });
      
      if (response.ok) {
        setSuccess(editingHoliday ? 'Holiday updated successfully' : 'Holiday added successfully');
        setShowHolidayModal(false);
        setEditingHoliday(null);
        loadHolidays();
      } else {
        setError('Failed to save holiday');
      }
    } catch (error) {
      setError('Error saving holiday');
    }
  };

  // Delete holiday
  const deleteHoliday = async (holidayId: string) => {
    if (!window.confirm(t('settings.holidays.confirmDelete'))) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/holidays/${holidayId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setSuccess('Holiday deleted successfully');
        loadHolidays();
      } else {
        setError('Failed to delete holiday');
      }
    } catch (error) {
      setError('Error deleting holiday');
    }
  };

  // Handle system settings submit
  const loadSystemSettings = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/settings/system', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setWeekendDays(data.weekendDays || ['Friday', 'Saturday']);
        // Convert holiday date strings to Date objects
        const holidays = data.holidays?.map((h: any) => new Date(h.date)) || [];
        setSelectedHolidays(holidays);
      }
    } catch (error) {
      console.error('Error loading system settings:', error);
    }
  };

  const handleSystemSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/settings/system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          weekendDays,
          holidays: selectedHolidays.map(date => ({
            date: date.toISOString().split('T')[0],
            type: 'custom'
          }))
        })
      });

      if (response.ok) {
        setSuccess(t('settings.general.settingsSaved'));
        setShowSuccessModal(true);
        // Close the modal after 3 seconds
        setTimeout(() => setShowSuccessModal(false), 3000);
      } else {
        const errorData = await response.text();
        console.error('Server response:', errorData);
        setError(t('settings.general.settingsError'));
      }
    } catch (error) {
      console.error('Error saving system settings:', error);
      setError(t('settings.general.settingsError'));
    } finally {
      setLoading(false);
    }
  };

  // Generate day, month, year options
  const days = Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'));
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

  // Modal handlers
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleCloseModal = () => {
    setShowAddTeacherModal(false);
  };

  const handleTeacherAdded = () => {
    // Refresh data when a new teacher is added if needed
    console.log('Teacher added successfully');
  };

  return (
    <SettingsContainer>
      <Sidebar onAddTeacher={handleAddTeacher} />
      
      <MainContent $isRTL={isRTL}>
        <Header>
          <HeaderLeft>
            <Logo>
              <LogoIcon />
              <LogoText>
                <h1>Genius Smart</h1>
                <p>Education</p>
              </LogoText>
            </Logo>
          </HeaderLeft>
        </Header>

        <TabContainer>
          <Tab $active={activeTab === 'personalInfo'} onClick={() => setActiveTab('personalInfo')}>
            {t('settings.personalInfo')}
          </Tab>
          <Tab $active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
            {t('settings.general')}
          </Tab>
          <Tab $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            {t('settings.security')}
          </Tab>
          <Tab $active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
            {t('settings.notifications')}
          </Tab>
          {currentUserRole === 'ADMIN' && (
            <Tab $active={activeTab === 'holidays'} onClick={() => setActiveTab('holidays')}>
              {t('settings.holidays')}
            </Tab>
          )}
        </TabContainer>

        {activeTab === 'personalInfo' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>{t('settings.general.title')}</FormTitle>
              <FormSubtitle>{t('settings.general.subtitle')}</FormSubtitle>
            </FormHeader>
            
            <Form onSubmit={handleSubmit}>
              {/* Profile Image Section */}
              <ImageUploadContainer>
                <ProfileImage $imageUrl={profileImage} />
                <ImageUploadButton type="button" onClick={() => fileInputRef.current?.click()}>
                  {t('settings.general.uploadButton')}
                </ImageUploadButton>
                <HiddenFileInput
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </ImageUploadContainer>

              {/* Personal Information */}
              <FormRow>
                <FormGroup>
                  <Label htmlFor="firstName" $isRTL={isRTL}>{t('settings.general.firstName')}</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.firstNamePlaceholder')}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="lastName" $isRTL={isRTL}>{t('settings.general.lastName')}</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.lastNamePlaceholder')}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="email" $isRTL={isRTL}>{t('settings.general.email')}</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.emailPlaceholder')}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="phone" $isRTL={isRTL}>{t('settings.general.phone')}</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('settings.general.phonePlaceholder')}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="address" $isRTL={isRTL}>{t('settings.general.address')}</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('settings.general.addressPlaceholder')}
                  required
                />
              </FormGroup>

              {/* Date of Birth */}
              <DateOfBirthContainer>
                <Label $isRTL={isRTL}>{t('settings.general.dateOfBirth')}</Label>
                <FormGroup>
                  <DateSelect
                    name="dateOfBirth.day"
                    value={formData.dateOfBirth.day}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('addTeacher.day')}</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </DateSelect>
                </FormGroup>
                <FormGroup>
                  <DateSelect
                    name="dateOfBirth.month"
                    value={formData.dateOfBirth.month}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('addTeacher.month')}</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </DateSelect>
                </FormGroup>
                <FormGroup>
                  <DateSelect
                    name="dateOfBirth.year"
                    value={formData.dateOfBirth.year}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">{t('addTeacher.year')}</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </DateSelect>
                </FormGroup>
              </DateOfBirthContainer>

              {/* Language Settings */}
              <FormGroup>
                <Label htmlFor="language" $isRTL={isRTL}>{t('settings.language')}</Label>
                <Select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'ar')}
                >
                  <option value="en">{t('settings.english')}</option>
                  <option value="ar">{t('settings.arabic')}</option>
                </Select>
                <HelperText>{t('settings.languageNote')}</HelperText>
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <SaveButton type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('settings.general.save')}
              </SaveButton>
            </Form>
          </FormContainer>
        )}

        {activeTab === 'notifications' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>{t('settings.notifications.title')}</FormTitle>
              <FormSubtitle>{t('settings.notifications.subtitle')}</FormSubtitle>
            </FormHeader>

            <NotificationContainer>
              <NotificationGroup>
                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.allNotifications')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.allNotifications} 
                    onClick={() => handleNotificationChange('allNotifications')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.earlyArrival')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.earlyArrival} 
                    onClick={() => handleNotificationChange('earlyArrival')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.lateArrival')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.lateArrival} 
                    onClick={() => handleNotificationChange('lateArrival')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.earlyLeaves')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.earlyLeaves} 
                    onClick={() => handleNotificationChange('earlyLeaves')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.lateLeaves')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.lateLeaves} 
                    onClick={() => handleNotificationChange('lateLeaves')}
                  />
                </NotificationItem>
              </NotificationGroup>

              <NotificationGroup>
                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.absentsTeachers')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.absentsTeachers} 
                    onClick={() => handleNotificationChange('absentsTeachers')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.dailyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.dailyReports} 
                    onClick={() => handleNotificationChange('dailyReports')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.weeklyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.weeklyReports} 
                    onClick={() => handleNotificationChange('weeklyReports')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.monthlyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.monthlyReports} 
                    onClick={() => handleNotificationChange('monthlyReports')}
                  />
                </NotificationItem>

                <NotificationItem>
                  <NotificationLabel>{t('settings.notifications.yearlyReports')}</NotificationLabel>
                  <ToggleSwitch 
                    $active={notifications.yearlyReports} 
                    onClick={() => handleNotificationChange('yearlyReports')}
                  />
                </NotificationItem>
              </NotificationGroup>
            </NotificationContainer>

            <TestSection>
              <TestSectionTitle>{t('settings.notifications.testTitle')}</TestSectionTitle>
              <p style={{ color: '#666', marginBottom: '16px', fontFamily: 'Poppins' }}>
                {t('settings.notifications.testDesc')}
              </p>
              <TestButtonGroup>
                <TestButton onClick={() => handleTestNotification('Early Leave')}>
                  {t('settings.notifications.testEarlyLeave')}
                </TestButton>
                <TestButton onClick={() => handleTestNotification('Absence')}>
                  {t('settings.notifications.testAbsence')}
                </TestButton>
                <TestButton onClick={() => handleTestNotification('Late Arrival')}>
                  {t('settings.notifications.testLateArrival')}
                </TestButton>
              </TestButtonGroup>
            </TestSection>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage>{success}</SuccessMessage>}
          </FormContainer>
        )}

        {activeTab === 'security' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>Change Password</FormTitle>
              <FormSubtitle>Update your account password for enhanced security</FormSubtitle>
            </FormHeader>

            <PasswordForm onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword" $isRTL={isRTL}>{t('settings.security.currentPassword')}</Label>
                <PasswordInput
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.currentPassword')}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="newPassword" $isRTL={isRTL}>{t('settings.security.newPassword')}</Label>
                <PasswordInput
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.newPassword')}
                  required
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="confirmPassword" $isRTL={isRTL}>{t('settings.security.confirmPassword')}</Label>
                <PasswordInput
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.confirmPassword')}
                  required
                />
              </FormGroup>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <SaveButton type="submit" disabled={loading}>
                {loading ? 'Changing Password...' : 'Change Password'}
              </SaveButton>
            </PasswordForm>
          </FormContainer>
        )}

        {activeTab === 'general' && (
          <FormContainer $isRTL={isRTL}>
            <FormHeader $isRTL={isRTL}>
              <FormTitle $isRTL={isRTL}>{t('settings.general.systemTitle')}</FormTitle>
              <FormSubtitle $isRTL={isRTL}>{t('settings.general.systemSubtitle')}</FormSubtitle>
            </FormHeader>

            <Form onSubmit={handleSystemSettingsSubmit}>
              {/* Weekend Days Section */}
              <WeekendSection $isRTL={isRTL}>
                <Label $isRTL={isRTL}>{t('settings.general.weekends')}</Label>
                <HelperText $isRTL={isRTL}>{t('settings.general.weekendsDesc')}</HelperText>
                <WeekendDays $isRTL={isRTL}>
                  {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day) => (
                    <DayCheckbox key={day} $isRTL={isRTL} className={weekendDays.includes(day) ? 'selected' : ''}>
                      <input
                        type="checkbox"
                        checked={weekendDays.includes(day)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWeekendDays([...weekendDays, day]);
                          } else {
                            setWeekendDays(weekendDays.filter(d => d !== day));
                          }
                        }}
                      />
                      {t(`settings.general.${day.toLowerCase()}`)}
                    </DayCheckbox>
                  ))}
                </WeekendDays>
              </WeekendSection>

              {/* Holidays Section */}
              <CalendarSection $isRTL={isRTL}>
                <Label $isRTL={isRTL}>{t('settings.general.holidaysTitle')}</Label>
                <HelperText $isRTL={isRTL}>{t('settings.general.holidaysDesc')}</HelperText>
                <CalendarWrapper $isRTL={isRTL}>
                  <HolidayCalendarComponent
                    currentMonth={currentMonth}
                    selectedDates={selectedHolidays}
                    onDateClick={(date) => {
                      const dateIndex = selectedHolidays.findIndex(d => 
                        d.getFullYear() === date.getFullYear() &&
                        d.getMonth() === date.getMonth() &&
                        d.getDate() === date.getDate()
                      );
                      
                      if (dateIndex === -1) {
                        setSelectedHolidays([...selectedHolidays, date]);
                      } else {
                        setSelectedHolidays(selectedHolidays.filter((_, i) => i !== dateIndex));
                      }
                    }}
                    onMonthChange={setCurrentMonth}
                    isRTL={isRTL}
                  />
                </CalendarWrapper>
                
                <SelectedHolidaysSection $isRTL={isRTL}>
                  <Label $isRTL={isRTL}>{t('settings.general.selectedHolidays')}</Label>
                  {selectedHolidays.length === 0 ? (
                    <HelperText $isRTL={isRTL}>{t('settings.general.noHolidaysSelected')}</HelperText>
                  ) : (
                    <HolidayTagsContainer $isRTL={isRTL}>
                      {selectedHolidays.map((date, index) => (
                        <HolidayTag key={index} $isRTL={isRTL}>
                          <span className="date-text">
                            {date.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </span>
                          <span
                            className="remove-btn"
                            onClick={() => {
                              setSelectedHolidays(selectedHolidays.filter((_, i) => i !== index));
                            }}
                          >
                            ×
                          </span>
                        </HolidayTag>
                      ))}
                    </HolidayTagsContainer>
                  )}
                </SelectedHolidaysSection>
              </CalendarSection>

              {error && <ErrorMessage>{error}</ErrorMessage>}
              {success && <SuccessMessage>{success}</SuccessMessage>}

              <SaveButton type="submit" disabled={loading}>
                {loading ? t('common.loading') : t('settings.general.saveSettings')}
              </SaveButton>
            </Form>
          </FormContainer>
        )}

        {activeTab === 'holidays' && currentUserRole === 'ADMIN' && (
          <FormContainer>
            <FormHeader>
              <FormTitle>{t('settings.holidays.title')}</FormTitle>
              <FormSubtitle>{t('settings.holidays.subtitle')}</FormSubtitle>
            </FormHeader>

            <HolidayManagementSection>
              <HolidayHeader>
                <h3>{t('settings.holidays.upcomingHolidays')}</h3>
                <AddHolidayButton onClick={() => setShowHolidayModal(true)}>
                  {t('settings.holidays.addHoliday')}
                </AddHolidayButton>
              </HolidayHeader>

              {holidays.length === 0 ? (
                <EmptyState>
                  <p>{t('settings.holidays.noHolidays')}</p>
                  <p>{t('settings.holidays.addFirst')}</p>
                </EmptyState>
              ) : (
                <HolidayList>
                  {holidays.map((holiday) => (
                    <HolidayCard key={holiday.id}>
                      <HolidayInfo>
                        <HolidayName>{isRTL ? holiday.nameAr : holiday.name}</HolidayName>
                        <HolidayDate>{new Date(holiday.date).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US')}</HolidayDate>
                        {holiday.description && <HolidayDescription>{holiday.description}</HolidayDescription>}
                        {holiday.isRecurring && (
                          <RecurringBadge>{t('settings.holidays.recurringNote')}</RecurringBadge>
                        )}
                      </HolidayInfo>
                      <HolidayActions>
                        <EditButton onClick={() => {
                          setEditingHoliday(holiday);
                          setShowHolidayModal(true);
                        }}>
                          {t('settings.holidays.editHoliday')}
                        </EditButton>
                        <DeleteButton onClick={() => deleteHoliday(holiday.id)}>
                          {t('settings.holidays.deleteHoliday')}
                        </DeleteButton>
                      </HolidayActions>
                    </HolidayCard>
                  ))}
                </HolidayList>
              )}
            </HolidayManagementSection>
          </FormContainer>
        )}
      </MainContent>
      
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={handleCloseModal}
        onSuccess={handleTeacherAdded}
      />
      
      <HolidayModal
        isOpen={showHolidayModal}
        onClose={() => {
          setShowHolidayModal(false);
          setEditingHoliday(null);
        }}
        onSave={saveHoliday}
        holiday={editingHoliday}
      />
      
      {/* Success Modal */}
      <ModalOverlay $show={showSuccessModal} onClick={() => setShowSuccessModal(false)} />
      <SuccessModal $show={showSuccessModal}>
        <div className="success-icon">✅</div>
        <h3>{t('settings.general.successTitle')}</h3>
        <p>{t('settings.general.successMessage')}</p>
        <button onClick={() => setShowSuccessModal(false)}>
          {t('settings.general.ok')}
        </button>
      </SuccessModal>
    </SettingsContainer>
  );
};

export default Settings; 