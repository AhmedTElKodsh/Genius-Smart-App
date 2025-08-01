import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2a2a2a' : 'white'};
  border-radius: 20px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: ${slideUp} 0.3s ease-out;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const IconContainer = styled.div<{ type: 'accept' | 'reject' }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: ${props => props.type === 'accept' 
    ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' 
    : 'linear-gradient(135deg, #f44336 0%, #da190b 100%)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 4px 12px ${props => props.type === 'accept' 
    ? 'rgba(76, 175, 80, 0.3)' 
    : 'rgba(244, 67, 54, 0.3)'
  };
`;

const Icon = styled.div`
  color: white;
  font-size: 32px;
  font-weight: bold;
`;

const Title = styled.h3<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 12px 0;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  text-align: center;
`;

const Message = styled.p<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#e0e0e0' : '#4a5568'};
  font-size: 16px;
  margin: 0 0 8px 0;
  line-height: 1.5;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  text-align: center;
`;

const RequestDetails = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#1a1a1a' : '#f7fafc'};
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;
  border: 1px solid ${props => props.isDarkMode ? '#333' : '#e2e8f0'};
`;

const DetailRow = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const DetailLabel = styled.span<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#b0b0b0' : '#718096'};
  font-size: 14px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const DetailValue = styled.span<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#2d3748'};
  font-size: 14px;
  font-weight: 600;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Warning = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? 'rgba(251, 191, 36, 0.1)' : '#fef3c7'};
  border: 1px solid ${props => props.isDarkMode ? '#fbbf24' : '#fcd34d'};
  border-radius: 8px;
  padding: 12px;
  margin: 16px 0;
  color: ${props => props.isDarkMode ? '#fbbf24' : '#b45309'};
  font-size: 14px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary'; type?: 'accept' | 'reject'; isDarkMode: boolean }>`
  flex: 1;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => {
    if (props.variant === 'primary') {
      if (props.type === 'accept') {
        return `
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
          }
        `;
      } else if (props.type === 'reject') {
        return `
          background: linear-gradient(135deg, #f44336 0%, #da190b 100%);
          color: white;
          &:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
          }
        `;
      }
    }
    return `
      background: ${props.isDarkMode ? '#3a3a3a' : '#e2e8f0'};
      color: ${props.isDarkMode ? '#ffffff' : '#4a5568'};
      &:hover {
        background: ${props.isDarkMode ? '#4a4a4a' : '#cbd5e0'};
      }
    `;
  }}
`;

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: 'accept' | 'reject';
  request: {
    name: string;
    requestType: string;
    duration: string;
    hours?: number;
    days?: number;
    reason?: string;
  };
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  request
}) => {
  const { t, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const translateRequestType = (requestType: string) => {
    switch (requestType) {
      case 'Early Leave':
        return t('requestTypes.earlyLeave');
      case 'Late Arrival':
        return t('requestTypes.lateArrival');
      case 'Absence':
      case 'Authorized Absence':
        return t('requestTypes.authorizedAbsence');
      default:
        return requestType;
    }
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent isDarkMode={isDarkMode} isRTL={isRTL}>
        <IconContainer type={type}>
          <Icon>{type === 'accept' ? '✓' : '✕'}</Icon>
        </IconContainer>
        
        <Title isDarkMode={isDarkMode} isRTL={isRTL}>
          {type === 'accept' 
            ? (isRTL ? 'تأكيد قبول الطلب' : 'Confirm Request Acceptance')
            : (isRTL ? 'تأكيد رفض الطلب' : 'Confirm Request Rejection')
          }
        </Title>
        
        <Message isDarkMode={isDarkMode} isRTL={isRTL}>
          {type === 'accept'
            ? (isRTL ? 'هل أنت متأكد من قبول هذا الطلب؟' : 'Are you sure you want to accept this request?')
            : (isRTL ? 'هل أنت متأكد من رفض هذا الطلب؟' : 'Are you sure you want to reject this request?')
          }
        </Message>
        
        <RequestDetails isDarkMode={isDarkMode} isRTL={isRTL}>
          <DetailRow isRTL={isRTL}>
            <DetailLabel isDarkMode={isDarkMode} isRTL={isRTL}>
              {isRTL ? 'المعلم' : 'Teacher'}
            </DetailLabel>
            <DetailValue isDarkMode={isDarkMode} isRTL={isRTL}>
              {request.name}
            </DetailValue>
          </DetailRow>
          
          <DetailRow isRTL={isRTL}>
            <DetailLabel isDarkMode={isDarkMode} isRTL={isRTL}>
              {isRTL ? 'نوع الطلب' : 'Request Type'}
            </DetailLabel>
            <DetailValue isDarkMode={isDarkMode} isRTL={isRTL}>
              {translateRequestType(request.requestType)}
            </DetailValue>
          </DetailRow>
          
          <DetailRow isRTL={isRTL}>
            <DetailLabel isDarkMode={isDarkMode} isRTL={isRTL}>
              {isRTL ? 'المدة' : 'Duration'}
            </DetailLabel>
            <DetailValue isDarkMode={isDarkMode} isRTL={isRTL}>
              {request.duration}
            </DetailValue>
          </DetailRow>
          
          {request.reason && (
            <DetailRow isRTL={isRTL}>
              <DetailLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                {isRTL ? 'السبب' : 'Reason'}
              </DetailLabel>
              <DetailValue isDarkMode={isDarkMode} isRTL={isRTL}>
                {request.reason}
              </DetailValue>
            </DetailRow>
          )}
        </RequestDetails>
        
        {type === 'accept' && (request.hours || request.days) && (
          <Warning isDarkMode={isDarkMode} isRTL={isRTL}>
            {request.hours && (
              isRTL 
                ? `سيتم خصم ${request.hours} ساعات من رصيد المعلم`
                : `${request.hours} hours will be deducted from the teacher's balance`
            )}
            {request.days && (
              isRTL 
                ? `سيتم خصم ${request.days} أيام من رصيد المعلم`
                : `${request.days} days will be deducted from the teacher's balance`
            )}
          </Warning>
        )}
        
        <ButtonContainer>
          <Button 
            variant="secondary" 
            isDarkMode={isDarkMode}
            onClick={onClose}
          >
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button 
            variant="primary" 
            type={type}
            isDarkMode={isDarkMode}
            onClick={onConfirm}
          >
            {type === 'accept'
              ? (isRTL ? 'قبول' : 'Accept')
              : (isRTL ? 'رفض' : 'Reject')
            }
          </Button>
        </ButtonContainer>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ConfirmationDialog;
