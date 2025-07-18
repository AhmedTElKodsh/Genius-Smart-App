import React from 'react';
import styled from 'styled-components';

const CardContainer = styled.div`
  background: #F3F1E4;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 120px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #141F25;
  margin: 0;
  line-height: 1.4;
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

const StatLabel = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #D6B10E;
  text-align: right;
`;

interface AnalyticsCardProps {
  title: string;
  count: number;
  label?: string;
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({ 
  title, 
  count, 
  label = 'Teachers' 
}) => {
  return (
    <CardContainer>
      <CardTitle>{title}</CardTitle>
      <StatSection>
        <StatNumber>{count}</StatNumber>
        <StatLabel>{label}</StatLabel>
      </StatSection>
    </CardContainer>
  );
};

export default AnalyticsCard; 