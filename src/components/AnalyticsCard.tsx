import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const CardContainer = styled.div<{ clickable?: boolean }>`
  background: #F3F1E4;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  transition: all 0.2s ease;
  cursor: ${props => props.clickable ? 'pointer' : 'default'};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    ${props => props.clickable && `
      background: #f0ee9d;
    `}
  }
`;

const CardTitle = styled.h3<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 500;
  color: #141F25;
  margin: 0;
  line-height: 1.4;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const StatSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
`;

const StatNumber = styled.div`
  width: 60px;
  height: 60px;
  background: #D6B10E;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Poppins', sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
`;

const StatLabel = styled.span<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 400;
  color: #D6B10E;
  text-align: right;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

interface AnalyticsCardProps {
  title: string;
  count: number;
  label?: string;
  onClick?: () => void;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  count, 
  label,
  onClick 
}) => {
  const { t, isRTL } = useLanguage();
  
  // Default label should be "Hours / ساعات" instead of "Teachers"
  const displayLabel = label || t('common.hours');
  
  return (
    <CardContainer clickable={!!onClick} onClick={onClick}>
      <CardTitle $isRTL={isRTL}>{title}</CardTitle>
      <StatSection>
        <StatNumber>{count}</StatNumber>
        <StatLabel $isRTL={isRTL}>{displayLabel}</StatLabel>
      </StatSection>
    </CardContainer>
  );
};

export default AnalyticsCard; 