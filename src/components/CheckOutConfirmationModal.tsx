import React from 'react';
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
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean; isOpen: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 40px 30px;
  margin: 20px;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: ${props => props.isDarkMode 
    ? '0 8px 32px rgba(0, 0, 0, 0.8)' 
    : '0 8px 32px rgba(0, 0, 0, 0.15)'
  };
  border: ${props => props.isDarkMode ? '1px solid #404040' : 'none'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  transform: scale(${props => props.isOpen ? 1 : 0.9});
  transition: all 0.3s ease;
`;

const ConfirmationText = styled.h3<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 40px 0;
  line-height: 1.5;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const ButtonContainer = styled.div<{ isRTL: boolean }>`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const ConfirmButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: #DAA520;
  color: white;
  border: none;
  padding: 15px 35px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    background: #B8860B;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(218, 165, 32, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

const CancelButton = styled.button<{ isDarkMode: boolean; isRTL: boolean }>`
  background: transparent;
  color: ${props => props.isDarkMode ? '#DAA520' : '#DAA520'};
  border: 2px solid #DAA520;
  padding: 13px 33px; /* Adjust padding to account for border */
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;

  &:hover {
    background: #DAA520;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(218, 165, 32, 0.4);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Types
interface CheckOutConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading?: boolean;
  isEarlyCheckout?: boolean;
  hoursWorked?: number;
}

const CheckOutConfirmationModal: React.FC<CheckOutConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  loading = false,
  isEarlyCheckout,
  hoursWorked
}) => {
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  const handleConfirm = () => {
    onConfirm();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const getConfirmationMessage = () => {
    if (isEarlyCheckout) {
      return t.earlyCheckoutWarning;
    }
    return t.checkOutConfirmation;
  };

  return (
    <ModalOverlay isOpen={isOpen} onClick={handleOverlayClick}>
      <ModalContent 
        isDarkMode={isDarkMode} 
        isRTL={isRTL}
        isOpen={isOpen}
        onClick={(e) => e.stopPropagation()}
      >
        <ConfirmationText isDarkMode={isDarkMode} isRTL={isRTL}>
          {getConfirmationMessage()}
        </ConfirmationText>
        
        <ButtonContainer isRTL={isRTL}>
          <CancelButton 
            isDarkMode={isDarkMode} 
            isRTL={isRTL} 
            onClick={onClose}
            disabled={loading}
          >
            {t.no}
          </CancelButton>
          <ConfirmButton 
            isDarkMode={isDarkMode} 
            isRTL={isRTL} 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? '...' : t.yes}
          </ConfirmButton>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default CheckOutConfirmationModal; 