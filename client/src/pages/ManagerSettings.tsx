import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import AddTeacherModal from '../components/AddTeacherModal';
import HolidayModal from '../components/HolidayModal';
import { useLanguage } from '../contexts/LanguageContext';
import { translations } from '../utils/translations';

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

const FormContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const FormHeader = styled.div`
  margin-bottom: 32px;
  text-align: center;
`;

const FormTitle = styled.h2<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const FormSubtitle = styled.p<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
  margin: 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
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

const SaveButton = styled.button<{ $isRTL?: boolean }>`
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
  text-align: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
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

const SuccessMessage = styled.div<{ $isRTL?: boolean }>`
  color: #155724;
  font-size: 15px;
  font-weight: 500;
  margin-top: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border-radius: 8px;
  border: 1px solid #c3e6cb;
  box-shadow: 0 2px 4px rgba(40, 167, 69, 0.1);
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const HelperText = styled.p`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  font-style: italic;
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

// Weekend and Holiday Selection Components
const SectionContainer = styled.div<{ $isRTL?: boolean }>`
  margin-bottom: 32px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const SectionTitle = styled.h3<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const SectionSubtitle = styled.p<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const WeekendDaysContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const DayCheckbox = styled.div<{ $selected: boolean; $isRTL?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border: 2px solid ${props => props.$selected ? '#D4AF37' : '#e0e0e0'};
  border-radius: 8px;
  background: ${props => props.$selected ? '#D4AF37' : 'white'};
  color: ${props => props.$selected ? 'white' : '#333'};
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    border-color: #D4AF37;
    ${props => !props.$selected && `
      background: #f9f9f9;
    `}
  }
`;

const SelectedHolidaysContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
`;

const HolidayTag = styled.div`
  background: #D4AF37;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RemoveHolidayButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.7;
  }
`;

// Enhanced Holiday Display Components
const SelectedHolidaysSection = styled.div`
  margin-top: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
`;

const SelectedHolidaysHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
`;

const HolidaysTitle = styled.h4<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const HolidayCount = styled.span<{ $isRTL?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
  background: #D4AF37;
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ClearAllButton = styled.button<{ $isRTL?: boolean }>`
  background: #f44336;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 12px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: #d32f2f;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
    transform: none;
  }
`;

const HolidaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const EnhancedHolidayCard = styled.div<{ $isRTL?: boolean }>`
  background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
  color: white;
  padding: 16px;
  border-radius: 12px;
  font-family: 'Poppins', sans-serif;
  position: relative;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.2);
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(212, 175, 55, 0.3);
    
    .remove-button {
      opacity: 1;
      visibility: visible;
    }
  }
`;

const HolidayCardDate = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const HolidayDay = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

const HolidayRemoveButton = styled.button<{ $isRTL?: boolean }>`
  position: absolute;
  top: 8px;
  right: ${props => props.$isRTL ? 'auto' : '8px'};
  left: ${props => props.$isRTL ? '8px' : 'auto'};
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: scale(1.1);
  }
`;

const NoHolidaysMessage = styled.div<{ $isRTL?: boolean }>`
  text-align: center;
  color: #666;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  padding: 20px;
  font-style: italic;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

// Calendar Components for Holiday Selection
const CalendarContainer = styled.div`
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
`;

const MonthSelector = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: white;
  color: #333;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
`;

const YearSelector = styled.select`
  padding: 8px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  background: white;
  color: #333;
  cursor: pointer;
  min-width: 100px;
  
  &:focus {
    outline: none;
    border-color: #D4AF37;
  }
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  max-width: 100%;
`;

const CalendarDayHeader = styled.div<{ $isRTL?: boolean }>`
  text-align: center;
  padding: 8px 4px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const CalendarDay = styled.div<{ 
  $isHoliday: boolean; 
  $isWeekend: boolean; 
  $isOtherMonth: boolean;
  $isRTL?: boolean;
}>`
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 13px;
  border-radius: 6px;
  cursor: ${props => props.$isOtherMonth ? 'default' : 'pointer'};
  transition: all 0.2s ease;
  position: relative;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  ${props => {
    if (props.$isOtherMonth) {
      return `
        color: #ccc;
        background: #f9f9f9;
      `;
    } else if (props.$isHoliday) {
      return `
        background: #D4AF37;
        color: white;
        font-weight: 600;
        box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);
      `;
    } else if (props.$isWeekend) {
      return `
        background: #f0f0f0;
        color: #999;
      `;
    } else {
      return `
        background: white;
        color: #333;
        border: 1px solid #e0e0e0;
        
        &:hover {
          background: #f9f9f9;
          border-color: #D4AF37;
        }
      `;
    }
  }}
`;



// Interfaces
interface ManagerProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: {
    day: string;
    month: string;
    year: string;
  };
  profileImage?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

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

const Settings: React.FC = () => {
  const navigate = useNavigate();
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
  
  // Weekend and holiday settings state
  const [weekendDays, setWeekendDays] = useState<number[]>([5, 6]); // Friday and Saturday by default
  const [selectedHolidays, setSelectedHolidays] = useState<Date[]>([]);
  
  // Calendar state for holiday selection
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      loadGeneralSettings();
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

  const loadGeneralSettings = async () => {
    try {
      const token = localStorage.getItem('authToken') || 'demo-manager-token-12345';
      
      const response = await fetch('http://localhost:5000/api/manager/general-settings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setWeekendDays(data.data.weekendDays || [5, 6]);
          setSelectedHolidays(
            (data.data.nationalHolidays || []).map((dateString: string) => new Date(dateString))
          );
        }
      } else {
        // Use defaults if no settings found
        console.log('No general settings found, using defaults');
      }
    } catch (err) {
      console.log('Error loading general settings, using defaults:', err);
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
      const response = await fetch('http://localhost:5000/api/manager/profile', {
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

  // Weekend and Holiday handlers
  const handleWeekendDayToggle = (dayIndex: number) => {
    setWeekendDays(prev => {
      if (prev.includes(dayIndex)) {
        return prev.filter(day => day !== dayIndex);
      } else {
        return [...prev, dayIndex];
      }
    });
  };

  const handleHolidayRemove = (dateToRemove: Date) => {
    setSelectedHolidays(prev => prev.filter(date => 
      date.toDateString() !== dateToRemove.toDateString()
    ));
  };

  const handleGeneralSettingsSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('authToken') || 'demo-manager-token-12345';
      
      const settingsData = {
        weekendDays,
        nationalHolidays: selectedHolidays.map(date => date.toISOString())
      };
      
      console.log('Sending settings data:', settingsData); // Debug log

      const response = await fetch('http://localhost:5000/api/manager/general-settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settingsData),
      });

      const responseText = await response.text();
      console.log('Response status:', response.status); // Debug log
      console.log('Response text:', responseText); // Debug log

      if (response.ok) {
        const successMessage = t('settings.general.saveSuccess')(weekendDays.length, selectedHolidays.length);
        setSuccess(successMessage);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        setError('Failed to update general settings');
        setTimeout(() => setError(''), 3000);
      }
    } catch (err) {
      console.error('Error in handleGeneralSettingsSave:', err); // Debug log
      setError('Error updating general settings');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Calendar utility functions
  const generateCalendarDays = (month: number, year: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty days for previous month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevMonthDay = new Date(year, month, -(startingDayOfWeek - 1 - i));
      days.push({
        date: prevMonthDay,
        day: prevMonthDay.getDate(),
        isCurrentMonth: false,
        isWeekend: weekendDays.includes(prevMonthDay.getDay()),
        isHoliday: selectedHolidays.some(holiday => 
          holiday.toDateString() === prevMonthDay.toDateString()
        )
      });
    }
    
    // Add days for current month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(year, month, day);
      days.push({
        date: currentDate,
        day: day,
        isCurrentMonth: true,
        isWeekend: weekendDays.includes(currentDate.getDay()),
        isHoliday: selectedHolidays.some(holiday => 
          holiday.toDateString() === currentDate.toDateString()
        )
      });
    }
    
    // Add days for next month to fill the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const nextMonthDay = new Date(year, month + 1, day);
      days.push({
        date: nextMonthDay,
        day: day,
        isCurrentMonth: false,
        isWeekend: weekendDays.includes(nextMonthDay.getDay()),
        isHoliday: selectedHolidays.some(holiday => 
          holiday.toDateString() === nextMonthDay.toDateString()
        )
      });
    }
    
    return days;
  };

  // Calendar holiday selection handlers
  const handleCalendarDayClick = (date: Date) => {
    const isAlreadySelected = selectedHolidays.some(holiday => 
      holiday.toDateString() === date.toDateString()
    );
    
    if (isAlreadySelected) {
      setSelectedHolidays(prev => prev.filter(holiday => 
        holiday.toDateString() !== date.toDateString()
      ));
    } else {
      setSelectedHolidays(prev => [...prev, date].sort((a, b) => a.getTime() - b.getTime()));
    }
  };



  const handleMonthChange = (month: number) => {
    setCalendarMonth(month);
  };

  const handleYearChange = (year: number) => {
    setCalendarYear(year);
  };

  const handleClearAllHolidays = () => {
    if (window.confirm(t('settings.general.clearAllHolidays') + '?')) {
      setSelectedHolidays([]);
    }
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
            {t('settings.personalInfoTab')}
          </Tab>
          <Tab $active={activeTab === 'general'} onClick={() => setActiveTab('general')}>
            {t('settings.generalTab')}
          </Tab>
          <Tab $active={activeTab === 'security'} onClick={() => setActiveTab('security')}>
            {t('settings.securityTab')}
          </Tab>
          <Tab $active={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')}>
            {t('settings.notificationsTab')}
          </Tab>
          {currentUserRole === 'ADMIN' && (
            <Tab $active={activeTab === 'holidays'} onClick={() => setActiveTab('holidays')}>
              {t('settings.holidaysTab')}
            </Tab>
          )}
        </TabContainer>

        {activeTab === 'personalInfo' && (
          <FormContainer>
            <FormHeader>
              <FormTitle $isRTL={isRTL}>{t('settings.personalInfo.title')}</FormTitle>
              <FormSubtitle $isRTL={isRTL}>{t('settings.personalInfo.subtitle')}</FormSubtitle>
            </FormHeader>
            
            <Form onSubmit={handleSubmit}>
              {/* Profile Image Section */}
              <ImageUploadContainer>
                <ProfileImage $imageUrl={profileImage} />
                <ImageUploadButton type="button" onClick={() => fileInputRef.current?.click()}>
                  {t('settings.personalInfo.uploadButton')}
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
                  <Label htmlFor="firstName" $isRTL={isRTL}>{t('settings.personalInfo.firstName')}</Label>
                  <Input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('settings.personalInfo.firstNamePlaceholder')}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="lastName" $isRTL={isRTL}>{t('settings.personalInfo.lastName')}</Label>
                  <Input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('settings.personalInfo.lastNamePlaceholder')}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label htmlFor="email" $isRTL={isRTL}>{t('settings.personalInfo.email')}</Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={t('settings.personalInfo.emailPlaceholder')}
                    required
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label htmlFor="phone" $isRTL={isRTL}>{t('settings.personalInfo.phone')}</Label>
                  <Input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder={t('settings.personalInfo.phonePlaceholder')}
                    required
                  />
                </FormGroup>
              </FormRow>

              <FormGroup>
                <Label htmlFor="address" $isRTL={isRTL}>{t('settings.personalInfo.address')}</Label>
                <Input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder={t('settings.personalInfo.addressPlaceholder')}
                  required
                />
              </FormGroup>

              {/* Date of Birth */}
              <DateOfBirthContainer>
                <Label $isRTL={isRTL}>{t('settings.personalInfo.dateOfBirth')}</Label>
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
            {success && <SuccessMessage $isRTL={isRTL}>{success}</SuccessMessage>}

            <SaveButton type="submit" disabled={loading} $isRTL={isRTL}>
                {loading ? t('common.loading') : t('settings.personalInfo.save')}
              </SaveButton>
            </Form>
          </FormContainer>
        )}

        {activeTab === 'general' && (
          <FormContainer>
            <FormHeader>
              <FormTitle $isRTL={isRTL}>{t('settings.general.title')}</FormTitle>
              <FormSubtitle $isRTL={isRTL}>{t('settings.general.subtitle')}</FormSubtitle>
            </FormHeader>

            {/* Weekend Days Selection */}
            <SectionContainer $isRTL={isRTL}>
              <SectionTitle $isRTL={isRTL}>{t('settings.general.weekendDays')}</SectionTitle>
              <SectionSubtitle $isRTL={isRTL}>{t('settings.general.weekendDaysSubtitle')}</SectionSubtitle>
              
              <WeekendDaysContainer>
                {(translations[language]?.dayNames || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).map((dayName: string, index: number) => (
                  <DayCheckbox
                    key={index}
                    $selected={weekendDays.includes(index)}
                    $isRTL={isRTL}
                    onClick={() => handleWeekendDayToggle(index)}
                  >
                    {dayName}
                  </DayCheckbox>
                ))}
              </WeekendDaysContainer>
            </SectionContainer>

            {/* National Holidays Selection */}
            <SectionContainer $isRTL={isRTL}>
              <SectionTitle $isRTL={isRTL}>{t('settings.general.nationalHolidays')}</SectionTitle>
              <SectionSubtitle $isRTL={isRTL}>{t('settings.general.nationalHolidaysSubtitle')}</SectionSubtitle>
              
              {/* Calendar Interface */}
              <CalendarContainer>
                <CalendarHeader>
                  <MonthSelector
                    value={calendarMonth}
                    onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                  >
                    {(translations[language]?.monthNames || [
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ]).map((month: string, index: number) => (
                      <option key={index} value={index}>{month}</option>
                    ))}
                  </MonthSelector>
                  
                  <YearSelector
                    value={calendarYear}
                    onChange={(e) => handleYearChange(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 5 }, (_, i) => {
                      const year = new Date().getFullYear() + i - 2;
                      return (
                        <option key={year} value={year}>{year}</option>
                      );
                    })}
                  </YearSelector>
                </CalendarHeader>

                <CalendarGrid>
                  {/* Day headers */}
                  {(translations[language]?.dayHeaders || ["S", "M", "T", "W", "T", "F", "S"]).map((dayHeader: string, index: number) => (
                    <CalendarDayHeader key={index} $isRTL={isRTL}>
                      {dayHeader}
                    </CalendarDayHeader>
                  ))}
                  
                  {/* Calendar days */}
                  {generateCalendarDays(calendarMonth, calendarYear).map((dayInfo, index) => (
                    <CalendarDay
                      key={index}
                      $isHoliday={dayInfo.isHoliday}
                      $isWeekend={dayInfo.isWeekend}
                      $isOtherMonth={!dayInfo.isCurrentMonth}
                      $isRTL={isRTL}
                      onClick={() => dayInfo.isCurrentMonth && handleCalendarDayClick(dayInfo.date)}
                    >
                      {dayInfo.day}
                    </CalendarDay>
                  ))}
                </CalendarGrid>
              </CalendarContainer>

              {/* Selected Holidays Display */}
              {selectedHolidays.length > 0 && (
                <SelectedHolidaysSection>
                  <SelectedHolidaysHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <HolidaysTitle $isRTL={isRTL}>
                        {t('settings.general.selectedHolidays')}
                      </HolidaysTitle>
                      <HolidayCount $isRTL={isRTL}>
                        {typeof t('settings.general.holidayCount') === 'function' 
                          ? t('settings.general.holidayCount')(selectedHolidays.length)
                          : `${selectedHolidays.length} ${selectedHolidays.length !== 1 ? (isRTL ? 'عطل' : 'holidays') : (isRTL ? 'عطلة' : 'holiday')} ${isRTL ? 'محددة' : 'selected'}`
                        }
                      </HolidayCount>
                    </div>
                    <ClearAllButton 
                      $isRTL={isRTL}
                      onClick={handleClearAllHolidays}
                      title={t('settings.general.clearAllHolidays')}
                    >
                      {t('settings.general.clearAllHolidays')}
                    </ClearAllButton>
                  </SelectedHolidaysHeader>
                  
                  <p style={{ 
                    color: '#666', 
                    fontSize: '14px', 
                    margin: '0 0 16px 0',
                    fontFamily: 'Poppins',
                    direction: isRTL ? 'rtl' : 'ltr'
                  }}>
                    {t('settings.general.selectedHolidaysSubtitle')}
                  </p>

                  <HolidaysGrid>
                    {selectedHolidays.map((holiday, index) => (
                      <EnhancedHolidayCard 
                        key={index} 
                        $isRTL={isRTL}
                        title={t('settings.general.removeHoliday')}
                      >
                        <HolidayCardDate>
                          {holiday.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </HolidayCardDate>
                        <HolidayDay>
                          {holiday.toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', {
                            weekday: 'long'
                          })}
                        </HolidayDay>
                        <HolidayRemoveButton 
                          className="remove-button"
                          $isRTL={isRTL}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHolidayRemove(holiday);
                          }}
                          title={t('settings.general.removeHoliday')}
                        >
                          ×
                        </HolidayRemoveButton>
                      </EnhancedHolidayCard>
                    ))}
                  </HolidaysGrid>
                </SelectedHolidaysSection>
              )}

              {selectedHolidays.length === 0 && (
                <SelectedHolidaysSection>
                  <NoHolidaysMessage $isRTL={isRTL}>
                    {isRTL ? 'لم يتم تحديد أي عطل بعد. استخدم التقويم أعلاه لاختيار التواريخ.' : 'No holidays selected yet. Use the calendar above to select dates.'}
                  </NoHolidaysMessage>
                </SelectedHolidaysSection>
              )}
            </SectionContainer>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage $isRTL={isRTL}>{success}</SuccessMessage>}

            <SaveButton type="button" onClick={handleGeneralSettingsSave} disabled={loading} $isRTL={isRTL}>
              {loading ? t('common.loading') : t('settings.general.save')}
            </SaveButton>
          </FormContainer>
        )}

        {activeTab === 'notifications' && (
          <FormContainer>
            <FormHeader>
              <FormTitle $isRTL={isRTL}>{t('settings.notifications.title')}</FormTitle>
                              <FormSubtitle $isRTL={isRTL}>{t('settings.notifications.subtitle')}</FormSubtitle>
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
          {success && <SuccessMessage $isRTL={isRTL}>{success}</SuccessMessage>}
        </FormContainer>
        )}

        {activeTab === 'security' && (
          <FormContainer>
            <FormHeader>
              <FormTitle $isRTL={isRTL}>{t('settings.security.title')}</FormTitle>
                              <FormSubtitle $isRTL={isRTL}>{t('settings.security.subtitle')}</FormSubtitle>
            </FormHeader>

            <PasswordForm onSubmit={handlePasswordSubmit}>
              <FormGroup>
                <Label htmlFor="currentPassword" $isRTL={isRTL}>{t('settings.security.currentPassword')}</Label>
                <PasswordInput
                  type={showCurrentPassword ? 'text' : 'password'}
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
                  type={showNewPassword ? 'text' : 'password'}
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
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder={t('settings.security.confirmPassword')}
                  required
                />
                          </FormGroup>

            {error && <ErrorMessage>{error}</ErrorMessage>}
            {success && <SuccessMessage $isRTL={isRTL}>{success}</SuccessMessage>}

            <SaveButton type="submit" disabled={loading} $isRTL={isRTL}>
              {loading ? t('settings.security.changingPassword') : t('settings.security.changePassword')}
              </SaveButton>
            </PasswordForm>
          </FormContainer>
        )}

        {activeTab === 'holidays' && currentUserRole === 'ADMIN' && (
          <FormContainer>
            <FormHeader>
              <FormTitle $isRTL={isRTL}>{t('settings.holidays.title')}</FormTitle>
                              <FormSubtitle $isRTL={isRTL}>{t('settings.holidays.subtitle')}</FormSubtitle>
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
    </SettingsContainer>
  );
};

export default Settings; 