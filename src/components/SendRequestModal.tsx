import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 2000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  padding: 20px;
  overflow-y: auto;
`;

const ModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  border-radius: 20px;
  padding: 0;
  margin-top: 60px;
  max-width: 500px;
  width: 100%;
  box-shadow: ${props => props.isDarkMode 
    ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
    : '0 4px 20px rgba(0, 0, 0, 0.15)'
  };
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  max-height: 90vh;
  overflow-y: auto;
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: #DAA520;
  padding: 20px 25px;
  border-radius: 20px 20px 0 0;
  display: flex;
  align-items: center;
  gap: 15px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const BackButton = styled.button<{ isRTL: boolean }>`
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 50%;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  transform: ${props => props.isRTL ? 'rotate(180deg)' : 'none'};

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const HeaderTitle = styled.h2<{ isRTL: boolean }>`
  color: white;
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Content = styled.div`
  padding: 25px;
`;

const RequestTypeGrid = styled.div<{ isRTL: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-bottom: 25px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const RequestTypeCard = styled.button<{ isDarkMode: boolean; isRTL: boolean; isSelected: boolean }>`
  background: ${props => props.isSelected ? '#DAA520' : (props.isDarkMode ? '#2a2a2a' : '#f8f9fa')};
  color: ${props => props.isSelected ? 'white' : (props.isDarkMode ? '#f0f0f0' : '#333')};
  border: ${props => props.isSelected ? '2px solid #DAA520' : `2px solid ${props.isDarkMode ? '#404040' : '#e9ecef'}`};
  border-radius: 12px;
  padding: 20px 15px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(218, 165, 32, 0.3);
  }
`;

const DurationSection = styled.div<{ isRTL: boolean }>`
  margin-bottom: 25px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const RadioGroup = styled.div<{ isRTL: boolean }>`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const RadioOption = styled.label<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const RadioInput = styled.input`
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #DAA520;
  border-radius: 50%;
  position: relative;
  cursor: pointer;

  &:checked::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    background: #DAA520;
    border-radius: 50%;
  }
`;

const DateSection = styled.div<{ isRTL: boolean }>`
  margin-bottom: 25px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const DateLabel = styled.label<{ isDarkMode: boolean; isRTL: boolean }>`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  margin-bottom: 8px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const DateInput = styled.input<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 100%;
  padding: 15px;
  border: 2px solid ${props => props.isDarkMode ? '#404040' : '#e9ecef'};
  border-radius: 12px;
  font-size: 16px;
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};

  &:focus {
    outline: none;
    border-color: #DAA520;
    box-shadow: 0 0 0 3px rgba(218, 165, 32, 0.1);
  }

  &::-webkit-calendar-picker-indicator {
    filter: ${props => props.isDarkMode ? 'invert(1)' : 'none'};
    cursor: pointer;
  }
`;

const ReasonSection = styled.div<{ isRTL: boolean }>`
  margin-bottom: 30px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const ReasonTextArea = styled.textarea<{ isDarkMode: boolean; isRTL: boolean; hasError?: boolean }>`
  width: 100%;
  min-height: 120px;
  padding: 15px;
  border: 2px solid ${props => {
    if (props.hasError) return '#dc3545';
    return props.isDarkMode ? '#404040' : '#e9ecef';
  }};
  border-radius: 12px;
  font-size: 16px;
  background: ${props => {
    if (props.hasError) return props.isDarkMode ? '#2a1f1f' : '#fdf2f2';
    return props.isDarkMode ? '#2a2a2a' : 'white';
  }};
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  resize: vertical;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? '#dc3545' : '#DAA520'};
    box-shadow: ${props => props.hasError 
      ? '0 0 0 3px rgba(220, 53, 69, 0.1)' 
      : '0 0 0 3px rgba(218, 165, 32, 0.1)'
    };
  }

  &::placeholder {
    color: ${props => {
      if (props.hasError) return '#dc3545';
      return props.isDarkMode ? '#888' : '#999';
    }};
  }
`;

const ReasonErrorMessage = styled.div<{ isDarkMode: boolean; isRTL: boolean; isVisible: boolean }>`
  color: #dc3545;
  font-size: 14px;
  margin-top: 8px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  opacity: ${props => props.isVisible ? 1 : 0};
  transform: translateY(${props => props.isVisible ? '0' : '-10px'});
  transition: all 0.3s ease;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-weight: 500;
`;

const SubmitButton = styled.button<{ isDarkMode: boolean; isRTL: boolean; isLoading: boolean }>`
  width: 100%;
  background: #DAA520;
  color: white;
  border: none;
  padding: 18px;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  opacity: ${props => props.isLoading ? 0.7 : 1};
  text-align: center;

  &:hover:not(:disabled) {
    background: #B8860B;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const WarningModal = styled.div<{ isVisible: boolean; isDarkMode: boolean; isRTL: boolean }>`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  border: 2px solid #ff6b6b;
  z-index: 3000;
  max-width: 400px;
  text-align: center;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  opacity: ${props => props.isVisible ? 1 : 0};
  visibility: ${props => props.isVisible ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  &::before {
    content: '⚠️';
    display: block;
    font-size: 24px;
    margin-bottom: 10px;
  }
`;

// Success Modal Components
const SuccessModalOverlay = styled.div<{ isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => props.isVisible ? 'flex' : 'none'};
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: ${props => props.isVisible ? 'fadeIn 0.3s ease-out' : 'none'};

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const SuccessModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 40px 30px;
  max-width: 320px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  border: 2px solid #DAA520;
  animation: slideUp 0.4s ease-out;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const SuccessIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #DAA520, #B8860B);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  font-size: 40px;
  color: white;
  animation: bounceIn 0.6s ease-out 0.2s both;

  @keyframes bounceIn {
    0% {
      transform: scale(0.3);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const SuccessTitle = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const SuccessMessage = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ccc' : '#666'};
  font-size: 16px;
  line-height: 1.5;
  margin: 0 0 30px 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const SuccessButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: linear-gradient(135deg, #DAA520, #B8860B);
  color: white;
  border: none;
  padding: 14px 40px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  min-width: 120px;

  &:hover {
    background: linear-gradient(135deg, #B8860B, #9A7209);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(218, 165, 32, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Hour Selection Components
const HourSelectionSection = styled.div<{ isRTL: boolean }>`
  margin-bottom: 20px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const HourSelectionLabel = styled.label<{ isDarkMode: boolean; isRTL: boolean }>`
  display: block;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  font-size: 16px;
`;

const HourOptionsGrid = styled.div<{ isRTL: boolean }>`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 15px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const HourOption = styled.button<{ isDarkMode: boolean; isRTL: boolean; isSelected: boolean }>`
  background: ${props => props.isSelected ? '#DAA520' : (props.isDarkMode ? '#2a2a2a' : '#f8f9fa')};
  color: ${props => props.isSelected ? 'white' : (props.isDarkMode ? '#f0f0f0' : '#333')};
  border: ${props => props.isSelected ? '2px solid #DAA520' : `2px solid ${props.isDarkMode ? '#404040' : '#e9ecef'}`};
  border-radius: 8px;
  padding: 10px;
  cursor: pointer;
  font-weight: 600;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  transition: all 0.2s;

  &:hover {
    background: ${props => props.isSelected ? '#B8860B' : (props.isDarkMode ? '#353535' : '#e9ecef')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CustomHourInput = styled.input<{ isDarkMode: boolean; isRTL: boolean; hasError?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: ${props => props.hasError 
    ? '2px solid #ff4757' 
    : `2px solid ${props.isDarkMode ? '#404040' : '#e9ecef'}`
  };
  border-radius: 8px;
  background: ${props => props.hasError
    ? (props.isDarkMode ? '#2a1a1a' : '#fff5f5')
    : (props.isDarkMode ? '#2a2a2a' : 'white')
  };
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  font-size: 16px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};

  &:focus {
    outline: none;
    border-color: #DAA520;
  }

  &::placeholder {
    color: ${props => props.isDarkMode ? '#888' : '#666'};
  }
`;

const RemainingHoursInfo = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(218, 165, 32, 0.1)' : 'rgba(218, 165, 32, 0.1)'};
  border: 1px solid rgba(218, 165, 32, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  text-align: center;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  font-size: 14px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const HourErrorMessage = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(255, 71, 87, 0.1)' : 'rgba(255, 71, 87, 0.1)'};
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-top: 10px;
  color: #ff4757;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  font-size: 14px;
  text-align: center;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

// Types
interface SendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherData: any;
  onRequestSubmitted: () => void;
}

const SendRequestModal: React.FC<SendRequestModalProps> = ({
  isOpen,
  onClose,
  teacherData,
  onRequestSubmitted
}) => {
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  const [selectedType, setSelectedType] = useState<string>('');
  const [duration, setDuration] = useState<'oneDay' | 'multipleDays'>('oneDay');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateWarning, setShowDateWarning] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showEmploymentError, setShowEmploymentError] = useState(false);
  const [employmentErrorMessage, setEmploymentErrorMessage] = useState('');
  const [showReasonError, setShowReasonError] = useState(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [showWeekendWarning, setShowWeekendWarning] = useState(false);
  
  // Hour tracking for Late Arrival and Early Leave
  const [selectedHours, setSelectedHours] = useState<number>(0.5);
  const [customHours, setCustomHours] = useState<string>('');
  const [useCustomHours, setUseCustomHours] = useState(false);
  const [remainingHours, setRemainingHours] = useState<number>(4); // Default 4 hours total
  const [showHourError, setShowHourError] = useState(false);

  // Helper function to check if a date is an Egyptian weekend (Friday = 5, Saturday = 6)
  const isEgyptianWeekend = (dateString: string) => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 5 || dayOfWeek === 6; // Friday (5) or Saturday (6)
  };

  // Fetch remaining hours when modal opens
  React.useEffect(() => {
    if (isOpen && teacherData?.id) {
      const fetchRemainingHours = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/teachers/${teacherData.id}/remaining-hours`);
          const data = await response.json();
          
          if (data.success) {
            setRemainingHours(data.data.remainingHours);
          }
        } catch (error) {
          console.error('Error fetching remaining hours:', error);
          // Keep default value of 4 if fetch fails
        }
      };

      fetchRemainingHours();
    }
  }, [isOpen, teacherData?.id]);

  const requestTypes = [
    { key: 'earlyLeave', label: t.earlyLeave },
    { key: 'lateArrival', label: t.lateArrival },
    { key: 'authorizedAbsence', label: t.authorizedAbsence }
  ];

  // Check if selected type can have multiple days
  const canHaveMultipleDays = false; // All request types are now one day only

  // Reset duration when switching to types that only allow one day
  const handleTypeSelection = (type: string) => {
    setSelectedType(type);
    // All types are now one day only
    setDuration('oneDay');
    setToDate(''); // Clear to date since it's not needed
  };

  // Handler for reason change to clear errors
  const handleReasonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReason(e.target.value);
    // Clear reason error when user starts typing
    if (showReasonError && e.target.value.trim()) {
      setShowReasonError(false);
    }
  };

  // Handler for closing modal with state cleanup
  const handleClose = () => {
    // Clear all error states when closing
    setShowReasonError(false);
    setHasAttemptedSubmit(false);
    setShowDateWarning(false);
    setShowEmploymentError(false);
    onClose();
  };

  // Function to check if date is valid based on request type
  const isValidDate = (date: string, requestType: string = selectedType) => {
    const selectedDate = new Date(date);
    const today = new Date();
    
    // Reset time to start of day for accurate comparison
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Different validation rules based on request type
    if (requestType === 'authorizedAbsence') {
      // Absence requests require 48 hours (2 days) advance notice
      const twoDaysFromNow = new Date(today);
      twoDaysFromNow.setDate(today.getDate() + 2);
      return selectedDate >= twoDaysFromNow;
    } else if (requestType === 'lateArrival' || requestType === 'earlyLeave') {
      // Late Arrival and Early Leave can be submitted on the same day
      return selectedDate >= today;
    } else {
      // Default case (fallback to 2 days advance notice)
      const twoDaysFromNow = new Date(today);
      twoDaysFromNow.setDate(today.getDate() + 2);
      return selectedDate >= twoDaysFromNow;
    }
  };

  // Function to get appropriate warning message based on request type
  const getDateWarningMessage = (requestType: string) => {
    if (requestType === 'authorizedAbsence') {
      return isRTL 
        ? 'يجب تقديم طلبات الغياب المصرح به قبل 48 ساعة على الأقل من التاريخ المطلوب. في حالات الطوارئ أو طلبات الغياب أقل من 48 ساعة، برجاء التواصل مباشرة مع المدير.'
        : 'Authorized Absence requests must be submitted at least 48 hours in advance. For emergency cases or absence requests less than 48 hours, please contact the Manager directly.';
    } else if (requestType === 'lateArrival' || requestType === 'earlyLeave') {
      return ((t as any).sameDayAllowed || 'Late Arrival and Early Leave requests can be submitted on the same day.');
    } else {
      return t.dateValidationWarning;
    }
  };

  // Function to handle date validation and show warning if needed
  const handleDateChange = (date: string, isFromDate: boolean = true) => {
    // Check if the date is an Egyptian weekend
    if (isEgyptianWeekend(date)) {
      setShowWeekendWarning(true);
      // Auto-hide warning after 4 seconds
      setTimeout(() => setShowWeekendWarning(false), 4000);
      return;
    }

    if (!isValidDate(date, selectedType)) {
      setShowDateWarning(true);
      // Auto-hide warning after 4 seconds
      setTimeout(() => setShowDateWarning(false), 4000);
      return;
    }
    
    if (isFromDate) {
      setFromDate(date);
    } else {
      setToDate(date);
    }
  };

  // Function to calculate employment duration in months
  const getEmploymentDurationInMonths = () => {
    // Try to get employment date from either employmentDate or joinDate field
    const employmentDateStr = teacherData?.employmentDate || teacherData?.joinDate;
    
    if (!employmentDateStr) {
      return 0;
    }
    
    const joinDate = new Date(employmentDateStr);
    const currentDate = new Date();
    
    // Check if date parsing was successful
    if (isNaN(joinDate.getTime())) {
      return 0;
    }
    
    // Calculate the difference in months more accurately
    const yearsDiff = currentDate.getFullYear() - joinDate.getFullYear();
    const monthsDiff = currentDate.getMonth() - joinDate.getMonth();
    const daysDiff = currentDate.getDate() - joinDate.getDate();
    
    // Calculate total months
    let totalMonths = yearsDiff * 12 + monthsDiff;
    
    // If we haven't reached the same day of the month, don't count the current month
    if (daysDiff < 0) {
      totalMonths--;
    }
    
    return Math.max(0, totalMonths); // Ensure non-negative result
  };

  // Function to get the start and end of current month
  const getCurrentMonthRange = () => {
    const now = new Date();
    
    // Calculate start of month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    // Calculate end of month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfMonth.setHours(23, 59, 59, 999);
    
    return { startOfMonth, endOfMonth };
  };

  // Function to count existing permitted leaves/absences for current month
  const countMonthlyPermittedRequests = async () => {
    try {
      const { startOfMonth, endOfMonth } = getCurrentMonthRange();
      
      const response = await fetch(`http://localhost:5000/api/requests/teacher/${teacherData.id}/all`);
      const data = await response.json();
      
      if (!data.success) return 0;
      
      // Access the requests array from the correct data structure
      const allRequests = data.data || [];
      
      // Filter for approved permitted leaves/absences in current month
      const monthlyRequests = allRequests.filter((request: any) => {
        // Check for authorized absence in both old and new formats
        const isAuthorizedAbsence = request.type === 'authorizedAbsence' || 
                                   request.requestType === 'Absence' ||
                                   request.requestType === 'PERMITTED_LEAVES';
        
        if (!isAuthorizedAbsence) return false;
        if (request.status !== 'approved') return false;
        
        // Try different date field names
        const requestDateStr = request.fromDate || request.duration || request.appliedDate;
        if (!requestDateStr) return false;
        
        const requestDate = new Date(requestDateStr);
        return requestDate >= startOfMonth && requestDate <= endOfMonth;
      });
      
      // Count total days (including multiple day requests)
      let totalDays = 0;
      monthlyRequests.forEach((request: any) => {
        if (request.duration === 'multipleDays' && request.toDate) {
          const fromDate = new Date(request.fromDate);
          const toDate = new Date(request.toDate);
          const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          totalDays += diffDays;
        } else {
          totalDays += 1;
        }
      });
      
      return totalDays;
    } catch (error) {
      console.error('Error counting monthly requests:', error);
      return 0;
    }
  };

  // Function to validate employment eligibility for permitted absences
  const validateEmploymentEligibility = async () => {
    // Only validate for authorized absence requests
    if (selectedType !== 'authorizedAbsence') {
      return { isValid: true, errorMessage: '' };
    }
    
    const employmentMonths = getEmploymentDurationInMonths();
    
    // Check if employee has completed 3 months
    if (employmentMonths < 3) {
      return {
        isValid: false,
        errorMessage: ((t as any).employmentValidation?.notEligibleYet || 'Not eligible yet')
      };
    }
    
    // Determine monthly limit based on employment duration
    const monthlyLimit = employmentMonths >= 24 ? 12 : 9; // 24 months = 2 years
    
    // Count existing approved requests for this month
    const existingDays = await countMonthlyPermittedRequests();
    
    // Calculate requested days
    let requestedDays = 1;
    if (canHaveMultipleDays && duration === 'multipleDays' && fromDate && toDate) {
      const fromDateObj = new Date(fromDate);
      const toDateObj = new Date(toDate);
      const diffTime = Math.abs(toDateObj.getTime() - fromDateObj.getTime());
      requestedDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
    
    // Check if request would exceed monthly limit
    if (existingDays + requestedDays > monthlyLimit) {
      if (existingDays >= monthlyLimit) {
        // Already used all days
        return {
          isValid: false,
          errorMessage: monthlyLimit === 12 
            ? ((t as any).employmentValidation?.usedAllDays12 || 'Used all 12 days')
            : ((t as any).employmentValidation?.usedAllDays9 || 'Used all 9 days')
        };
      } else {
        // Would exceed limit
        return {
          isValid: false,
          errorMessage: monthlyLimit === 12
            ? ((t as any).employmentValidation?.exceededMonthlyLimit12 || 'Would exceed 12 days limit')
            : ((t as any).employmentValidation?.exceededMonthlyLimit9 || 'Would exceed 9 days limit')
        };
      }
    }
    
    return { isValid: true, errorMessage: '' };
  };

  const handleSubmit = async () => {
    // Mark that submit has been attempted
    setHasAttemptedSubmit(true);
    
    // Validate form based on type restrictions
    if (!selectedType || !fromDate) {
      return;
    }
    
    // Make reason mandatory for all request types - show clear error
    if (!reason.trim()) {
      setShowReasonError(true);
      setTimeout(() => setShowReasonError(false), 4000);
      return;
    }
    
    // Validate hours for Late Arrival and Early Leave requests
    if (selectedType === 'lateArrival' || selectedType === 'earlyLeave') {
      let requestedHours = selectedHours;
      
      if (useCustomHours) {
        const customHoursNum = parseFloat(customHours);
        if (!customHours || isNaN(customHoursNum) || customHoursNum < 0.5 || customHoursNum > 2) {
          setShowHourError(true);
          setTimeout(() => setShowHourError(false), 4000);
          return;
        }
        requestedHours = customHoursNum;
      }
      
      // Check if requested hours exceed remaining hours
      if (requestedHours > remainingHours) {
        setShowHourError(true);
        setTimeout(() => setShowHourError(false), 4000);
        return;
      }
      
      // Check daily limit (max 2 hours per day)
      if (requestedHours > 2) {
        setShowHourError(true);
        setTimeout(() => setShowHourError(false), 4000);
        return;
      }
    }
    
    // Clear reason error if it was shown before
    setShowReasonError(false);
    // (Note: Since canHaveMultipleDays is now false, the toDate check is no longer needed)

    // Validate date requirements based on request type
    if (!isValidDate(fromDate, selectedType)) {
      setShowDateWarning(true);
      setTimeout(() => setShowDateWarning(false), 4000);
      return;
    }

    // Note: Multiple days validation removed since all requests are now one day only

    // Validate employment eligibility for permitted absences
    const employmentValidation = await validateEmploymentEligibility();
    if (!employmentValidation.isValid) {
      setEmploymentErrorMessage(employmentValidation.errorMessage);
      setShowEmploymentError(true);
      // Auto-hide error after 5 seconds
      setTimeout(() => setShowEmploymentError(false), 5000);
      return;
    }

    setIsSubmitting(true);

    try {
      // All requests are now one day only
      const actualDuration = 'oneDay';
      const actualToDate = fromDate;
      
      // Calculate final hours for Late Arrival and Early Leave
      let finalHours = undefined;
      if (selectedType === 'lateArrival' || selectedType === 'earlyLeave') {
        finalHours = useCustomHours ? parseFloat(customHours) : selectedHours;
      }
      
      const requestData = {
        teacherId: teacherData.id,
        teacherName: teacherData.name,
        type: selectedType,
        duration: actualDuration,
        fromDate: fromDate,
        toDate: actualToDate,
        reason: reason || '',
        status: 'pending',
        submittedAt: new Date().toISOString(),
        subject: teacherData.subject || '',
        hours: finalHours // Include hours for Late Arrival and Early Leave
      };

      const response = await fetch('http://localhost:5000/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        // Reset form
        setSelectedType('');
        setDuration('oneDay');
        setFromDate('');
        setToDate('');
        setReason('');
        
        // Clear error states
        setShowReasonError(false);
        setHasAttemptedSubmit(false);
        
        onRequestSubmitted();
        
        // Show custom success modal instead of alert
        setShowSuccessModal(true);
      } else {
        alert(`${t.requestError}: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`${t.requestError}: ${(error as Error).message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = selectedType && fromDate && reason.trim(); // Reason is mandatory for all request types

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleClose}>
      <ModalContent 
        isDarkMode={isDarkMode} 
        isRTL={isRTL}
        onClick={(e) => e.stopPropagation()}
      >
        <Header isDarkMode={isDarkMode} isRTL={isRTL}>
          <BackButton isRTL={isRTL} onClick={handleClose}>
            ←
          </BackButton>
          <HeaderTitle isRTL={isRTL}>
            {t.sendRequest}
          </HeaderTitle>
        </Header>

        <Content>
          {/* Request Type Selection */}
          <RequestTypeGrid isRTL={isRTL}>
            {requestTypes.map((type) => (
              <RequestTypeCard
                key={type.key}
                isDarkMode={isDarkMode}
                isRTL={isRTL}
                isSelected={selectedType === type.key}
                onClick={() => handleTypeSelection(type.key)}
              >
                {type.label}
              </RequestTypeCard>
            ))}
          </RequestTypeGrid>

          {/* Duration Selection - Only for Authorized Absence */}
          {canHaveMultipleDays && (
            <DurationSection isRTL={isRTL}>
              <RadioGroup isRTL={isRTL}>
                <RadioOption isDarkMode={isDarkMode} isRTL={isRTL}>
                  <RadioInput
                    type="radio"
                    name="duration"
                    checked={duration === 'oneDay'}
                    onChange={() => setDuration('oneDay')}
                  />
                  {t.oneDay}
                </RadioOption>
                <RadioOption isDarkMode={isDarkMode} isRTL={isRTL}>
                  <RadioInput
                    type="radio"
                    name="duration"
                    checked={duration === 'multipleDays'}
                    onChange={() => setDuration('multipleDays')}
                  />
                  {t.multipleDays}
                </RadioOption>
              </RadioGroup>
            </DurationSection>
          )}

          {/* Date Selection */}
          {(!canHaveMultipleDays || duration === 'oneDay') ? (
            <DateSection isRTL={isRTL}>
              <DateLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {t.date}
              </DateLabel>
              <DateInput
                type="date"
                value={fromDate}
                onChange={(e) => handleDateChange(e.target.value)}
                isDarkMode={isDarkMode}
                isRTL={isRTL}
              />
            </DateSection>
          ) : (
            <>
              <DateSection isRTL={isRTL}>
                <DateLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.fromDate}
                </DateLabel>
                <DateInput
                  type="date"
                  value={fromDate}
                  onChange={(e) => handleDateChange(e.target.value)}
                  isDarkMode={isDarkMode}
                  isRTL={isRTL}
                />
              </DateSection>
              <DateSection isRTL={isRTL}>
                <DateLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.toDate}
                </DateLabel>
                <DateInput
                  type="date"
                  value={toDate}
                  onChange={(e) => handleDateChange(e.target.value, false)}
                  isDarkMode={isDarkMode}
                  isRTL={isRTL}
                  min={fromDate}
                />
              </DateSection>
            </>
          )}

          {/* Hour Selection for Late Arrival and Early Leave */}
          {(selectedType === 'lateArrival' || selectedType === 'earlyLeave') && (
            <HourSelectionSection isRTL={isRTL}>
              <HourSelectionLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL ? 'عدد الساعات' : 'Number of Hours'}
              </HourSelectionLabel>
              
              <RemainingHoursInfo isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL 
                  ? `الساعات المتبقية: ${remainingHours} من 4 ساعات`
                  : `Remaining Hours: ${remainingHours} out of 4 hours`
                }
              </RemainingHoursInfo>

              <HourOptionsGrid isRTL={isRTL}>
                <HourOption
                  isDarkMode={isDarkMode}
                  isRTL={isRTL}
                  isSelected={!useCustomHours && selectedHours === 0.5}
                  disabled={remainingHours < 0.5}
                  onClick={() => {
                    setSelectedHours(0.5);
                    setUseCustomHours(false);
                    setCustomHours('');
                    setShowHourError(false);
                  }}
                >
                  {isRTL ? '0.5 ساعة' : '0.5 Hours'}
                </HourOption>
                <HourOption
                  isDarkMode={isDarkMode}
                  isRTL={isRTL}
                  isSelected={!useCustomHours && selectedHours === 1}
                  disabled={remainingHours < 1}
                  onClick={() => {
                    setSelectedHours(1);
                    setUseCustomHours(false);
                    setCustomHours('');
                    setShowHourError(false);
                  }}
                >
                  {isRTL ? '1 ساعة' : '1 Hour'}
                </HourOption>
                <HourOption
                  isDarkMode={isDarkMode}
                  isRTL={isRTL}
                  isSelected={!useCustomHours && selectedHours === 2}
                  disabled={remainingHours < 2}
                  onClick={() => {
                    setSelectedHours(2);
                    setUseCustomHours(false);
                    setCustomHours('');
                    setShowHourError(false);
                  }}
                >
                  {isRTL ? '2 ساعة' : '2 Hours'}
                </HourOption>
              </HourOptionsGrid>

              <HourOption
                isDarkMode={isDarkMode}
                isRTL={isRTL}
                isSelected={useCustomHours}
                onClick={() => {
                  setUseCustomHours(true);
                  setShowHourError(false);
                }}
                style={{ marginBottom: '10px', width: '100%' }}
              >
                {isRTL ? 'ادخال ساعات مخصصة' : 'Enter Custom Hours'}
              </HourOption>

              {useCustomHours && (
                <CustomHourInput
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="2"
                  value={customHours}
                  onChange={(e) => {
                    setCustomHours(e.target.value);
                    setShowHourError(false);
                  }}
                  placeholder={isRTL ? 'ادخل عدد الساعات (0.5 - 2)' : 'Enter hours (0.5 - 2)'}
                  isDarkMode={isDarkMode}
                  isRTL={isRTL}
                  hasError={showHourError}
                />
              )}

              {showHourError && (
                <HourErrorMessage isDarkMode={isDarkMode} isRTL={isRTL}>
                  {isRTL 
                    ? 'يرجى إدخال عدد ساعات صحيح (حد أقصى 2 ساعة يومياً)'
                    : 'Please enter a valid number of hours (max 2 hours per day)'
                  }
                </HourErrorMessage>
              )}
            </HourSelectionSection>
          )}

          {/* Reason */}
          <ReasonSection isRTL={isRTL}>
            <DateLabel isDarkMode={isDarkMode} isRTL={isRTL}>
              {`${t.reason} (${isRTL ? 'مطلوب' : 'required'})`}
            </DateLabel>
            <ReasonTextArea
              value={reason}
              onChange={handleReasonChange}
              placeholder={`${t.reason} (${isRTL ? 'مطلوب' : 'required'})`}
              isDarkMode={isDarkMode}
              isRTL={isRTL}
              hasError={showReasonError || (hasAttemptedSubmit && !reason.trim())}
              required={true}
            />
            <ReasonErrorMessage
              isDarkMode={isDarkMode}
              isRTL={isRTL}
              isVisible={showReasonError || (hasAttemptedSubmit && !reason.trim())}
            >
              {isRTL 
                ? 'يرجى إدخال سبب الطلب قبل الإرسال'
                : 'Please enter a reason for your request before submitting'
              }
            </ReasonErrorMessage>
          </ReasonSection>

          {/* Submit Button */}
          <SubmitButton
            isDarkMode={isDarkMode}
            isRTL={isRTL}
            isLoading={isSubmitting}
            disabled={!isFormValid || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? 'Submitting...' : t.submitRequest}
          </SubmitButton>
          
        </Content>
      </ModalContent>
      
      {/* Date Validation Warning */}
      <WarningModal
        isVisible={showDateWarning}
        isDarkMode={isDarkMode}
        isRTL={isRTL}
      >
        {getDateWarningMessage(selectedType)}
      </WarningModal>

      {/* Employment Validation Error */}
      <WarningModal
        isVisible={showEmploymentError}
        isDarkMode={isDarkMode}
        isRTL={isRTL}
      >
        {employmentErrorMessage}
      </WarningModal>

      {/* Weekend Warning */}
      <WarningModal
        isVisible={showWeekendWarning}
        isDarkMode={isDarkMode}
        isRTL={isRTL}
      >
        {isRTL 
          ? 'لا يمكن تقديم طلبات للأيام عطلة نهاية الأسبوع (الجمعة والسبت)'
          : 'Cannot submit requests for weekend days (Friday and Saturday)'
        }
      </WarningModal>

      {/* Success Modal */}
      <SuccessModalOverlay isVisible={showSuccessModal}>
        <SuccessModalContent isDarkMode={isDarkMode} isRTL={isRTL}>
          <SuccessIcon>✓</SuccessIcon>
          <SuccessTitle isDarkMode={isDarkMode} isRTL={isRTL}>
            {t.requestSubmitted}
          </SuccessTitle>
          <SuccessMessage isDarkMode={isDarkMode} isRTL={isRTL}>
            {t.requestSubmittedMessage}
          </SuccessMessage>
          <SuccessButton isDarkMode={isDarkMode} isRTL={isRTL} onClick={() => {
            setShowSuccessModal(false);
            onClose();
          }}>
            {t.ok}
          </SuccessButton>
        </SuccessModalContent>
      </SuccessModalOverlay>
    </ModalOverlay>
  );
};

export default SendRequestModal; 