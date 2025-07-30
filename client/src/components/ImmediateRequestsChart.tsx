import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const ChartContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fff7ed 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #fed7aa;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f59e0b, #d97706);
  }
`;

const ChartHeader = styled.div<{ $isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TitleSection = styled.div<{ $isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const IconWrapper = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f59e0b, #d97706);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  animation: pulse 2s infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
`;

const ChartTitle = styled.h3<{ $isRTL: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const UrgencyIndicator = styled.span<{ $urgency: 'high' | 'medium' }>`
  font-size: 14px;
  color: ${props => props.$urgency === 'high' ? '#dc2626' : '#f59e0b'};
  padding: 8px 16px;
  background: ${props => props.$urgency === 'high' ? '#fef2f2' : '#fff7ed'};
  border-radius: 20px;
  font-weight: 600;
  border: 1px solid ${props => props.$urgency === 'high' ? '#fecaca' : '#fed7aa'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  animation: ${props => props.$urgency === 'high' ? 'blink 1.5s infinite' : 'none'};
  
  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0.7; }
  }
`;

const FilterContainer = styled.div<{ $isRTL: boolean }>`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const FilterButton = styled.button<{ $active: boolean; $isRTL: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: 2px solid ${props => props.$active ? '#f59e0b' : '#e2e8f0'};
  background: ${props => props.$active ? '#f59e0b' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#64748b'};
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $urgency: 'total' | 'tomorrow' | 'day-after' }>`
  text-align: center;
  padding: 20px 16px;
  border-radius: 12px;
  background: ${props => {
    switch (props.$urgency) {
      case 'tomorrow': return 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)';
      case 'day-after': return 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)';
      default: return 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$urgency) {
      case 'tomorrow': return '#fca5a5';
      case 'day-after': return '#fed7aa';
      default: return '#cbd5e1';
    }
  }};
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
`;

const StatNumber = styled.div<{ $urgency: 'total' | 'tomorrow' | 'day-after' }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => {
    switch (props.$urgency) {
      case 'tomorrow': return '#dc2626';
      case 'day-after': return '#f59e0b';
      default: return '#64748b';
    }
  }};
  margin-bottom: 4px;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const TableHeader = styled.div`
  background: linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%);
  padding: 16px 20px;
  border-bottom: 2px solid #fed7aa;
  font-weight: 600;
  color: #374151;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableContent = styled.div`
  max-height: 400px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #fff7ed;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #fed7aa;
    border-radius: 3px;
  }
`;

const RequestRow = styled.div<{ $isRTL: boolean; $urgency: 'high' | 'medium' }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  border-left: 4px solid ${props => props.$urgency === 'high' ? '#dc2626' : '#f59e0b'};
  
  &:hover {
    background: ${props => props.$urgency === 'high' 
      ? 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)' 
      : 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 100%)'
    };
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const RequestAvatar = styled.div<{ $urgency: 'high' | 'medium' }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: ${props => props.$urgency === 'high' 
    ? 'linear-gradient(135deg, #dc2626, #b91c1c)' 
    : 'linear-gradient(135deg, #f59e0b, #d97706)'
  };
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-right: 16px;
  box-shadow: ${props => props.$urgency === 'high' 
    ? '0 2px 8px rgba(220, 38, 38, 0.3)' 
    : '0 2px 8px rgba(245, 158, 11, 0.3)'
  };
`;

const RequestInfo = styled.div<{ $isRTL: boolean }>`
  flex: 1;
  margin-${props => props.$isRTL ? 'right' : 'left'}: ${props => props.$isRTL ? '16px' : '0'};
  margin-${props => props.$isRTL ? 'left' : 'right'}: ${props => props.$isRTL ? '0' : '16px'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const TeacherName = styled.div`
  font-weight: 600;
  font-size: 15px;
  color: #1e293b;
  margin-bottom: 4px;
  line-height: 1.3;
`;

const RequestDetails = styled.div`
  font-size: 13px;
  color: #64748b;
  margin-bottom: 4px;
`;

const RequestType = styled.span<{ $type: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => {
    switch (props.$type.toLowerCase()) {
      case 'early leave': case 'إذن انصراف مبكر': return '#fef3c7';
              case 'late arrival': case 'وصول متأخر': return '#fde68a';
      case 'absence': case 'غياب': return '#fee2e2';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$type.toLowerCase()) {
      case 'early leave': case 'إذن انصراف مبكر': return '#92400e';
              case 'late arrival': case 'وصول متأخر': return '#d97706';
      case 'absence': case 'غياب': return '#dc2626';
      default: return '#4b5563';
    }
  }};
`;

const RequestMeta = styled.div<{ $isRTL: boolean }>`
  text-align: ${props => props.$isRTL ? 'left' : 'right'};
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isRTL ? 'flex-start' : 'flex-end'};
`;

const TargetDate = styled.div<{ $urgency: 'high' | 'medium' }>`
  font-size: 14px;
  color: ${props => props.$urgency === 'high' ? '#dc2626' : '#f59e0b'};
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: ${props => props.$urgency === 'high' ? "'🚨'" : "'⚠️'"};
    font-size: 12px;
  }
`;

const SubmittedTime = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  text-align: center;
`;

const UrgencyBadge = styled.span<{ $urgency: 'high' | 'medium' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
  background: ${props => props.$urgency === 'high' 
    ? 'linear-gradient(135deg, #fef2f2, #fecaca)' 
    : 'linear-gradient(135deg, #fff7ed, #fed7aa)'
  };
  color: ${props => props.$urgency === 'high' ? '#991b1b' : '#92400e'};
  border: 1px solid ${props => props.$urgency === 'high' ? '#fca5a5' : '#fbbf24'};
  animation: ${props => props.$urgency === 'high' ? 'pulse 2s infinite' : 'none'};
  
  &::before {
    content: ${props => props.$urgency === 'high' ? "'🚨'" : "'⚠️'"};
    font-size: 10px;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #64748b;
  
  &::before {
    content: '⏳';
    font-size: 32px;
    margin-bottom: 12px;
    animation: spin 2s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #dc2626;
  background: #fef2f2;
  border-radius: 12px;
  border: 1px solid #fecaca;
  
  &::before {
    content: '⚠️';
    font-size: 32px;
    margin-bottom: 12px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #64748b;
  
  &::before {
    content: '✅';
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

interface ImmediateRequestsData {
  tomorrow: {
    date: string;
    count: number;
    requests: Array<{
      id: string;
      teacherName: string;
      subject: string;
      requestType: string;
      reason: string;
      duration: string;
      submittedAt: string;
      urgency: string;
      targetDate: string;
    }>;
  };
  dayAfterTomorrow: {
    date: string;
    count: number;
    requests: Array<{
      id: string;
      teacherName: string;
      subject: string;
      requestType: string;
      reason: string;
      duration: string;
      submittedAt: string;
      urgency: string;
      targetDate: string;
    }>;
  };
  total: number;
  allRequests: any[];
}

interface ImmediateRequestsChartProps {
  data: ImmediateRequestsData | null;
  loading?: boolean;
  error?: string | null;
}

const ImmediateRequestsChart: React.FC<ImmediateRequestsChartProps> = ({ data, loading, error }) => {
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'tomorrow' | 'day-after'>('all');

  if (loading) {
    return (
      <ChartContainer>
        <LoadingContainer>
          {t('loading') || 'Loading immediate requests...'}
        </LoadingContainer>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </ChartContainer>
    );
  }

  if (!data || data.total === 0) {
    return (
      <ChartContainer>
        <ChartHeader $isRTL={isRTL}>
          <TitleSection $isRTL={isRTL}>
            <IconWrapper>⚡</IconWrapper>
            <ChartTitle $isRTL={isRTL}>
              {isRTL ? 'طلبات عاجلة' : 'Immediate Requests'}
            </ChartTitle>
          </TitleSection>
          <UrgencyIndicator $urgency="medium">
            {isRTL ? 'لا توجد طلبات عاجلة' : 'No Urgent Requests'}
          </UrgencyIndicator>
        </ChartHeader>
        <EmptyState>
          {isRTL ? 'لا توجد طلبات عاجلة للـ 48 ساعة القادمة' : 'No immediate requests for the next 48 hours'}
        </EmptyState>
      </ChartContainer>
    );
  }

  const getFilteredRequests = () => {
    switch (filter) {
      case 'tomorrow':
        return data.tomorrow.requests;
      case 'day-after':
        return data.dayAfterTomorrow.requests;
      default:
        return [...data.tomorrow.requests, ...data.dayAfterTomorrow.requests];
    }
  };

  const filteredRequests = getFilteredRequests();
  const highUrgencyCount = filteredRequests.filter(req => req.urgency === 'high').length;
  const hasHighUrgency = highUrgencyCount > 0;

  return (
    <ChartContainer>
      <ChartHeader $isRTL={isRTL}>
        <TitleSection $isRTL={isRTL}>
          <IconWrapper>⚡</IconWrapper>
          <ChartTitle $isRTL={isRTL}>
            {isRTL ? 'طلبات عاجلة' : 'Immediate Requests'}
          </ChartTitle>
        </TitleSection>
        <UrgencyIndicator $urgency={hasHighUrgency ? 'high' : 'medium'}>
          {hasHighUrgency 
            ? (isRTL ? 'طلبات عالية الأولوية' : 'High Priority') 
            : (isRTL ? 'طلبات متوسطة الأولوية' : 'Medium Priority')
          }
        </UrgencyIndicator>
      </ChartHeader>

      <FilterContainer $isRTL={isRTL}>
        <FilterButton 
          $active={filter === 'all'} 
          $isRTL={isRTL}
          onClick={() => setFilter('all')}
        >
          {isRTL ? 'الكل' : 'All'}
        </FilterButton>
        <FilterButton 
          $active={filter === 'tomorrow'} 
          $isRTL={isRTL}
          onClick={() => setFilter('tomorrow')}
        >
          {isRTL ? 'غداً (24 ساعة)' : 'Tomorrow (24h)'}
        </FilterButton>
        <FilterButton 
          $active={filter === 'day-after'} 
          $isRTL={isRTL}
          onClick={() => setFilter('day-after')}
        >
          {isRTL ? 'بعد غد (48 ساعة)' : 'Day After (48h)'}
        </FilterButton>
      </FilterContainer>

      <StatsContainer>
        <StatCard $urgency="total">
          <StatNumber $urgency="total">{data.total}</StatNumber>
          <StatLabel>{isRTL ? 'إجمالي الطلبات' : 'Total Requests'}</StatLabel>
        </StatCard>
        <StatCard $urgency="tomorrow">
          <StatNumber $urgency="tomorrow">{data.tomorrow.count}</StatNumber>
          <StatLabel>{isRTL ? 'طلبات الغد' : 'Tomorrow'}</StatLabel>
        </StatCard>
        <StatCard $urgency="day-after">
          <StatNumber $urgency="day-after">{data.dayAfterTomorrow.count}</StatNumber>
          <StatLabel>{isRTL ? 'طلبات بعد الغد' : 'Day After'}</StatLabel>
        </StatCard>
      </StatsContainer>

      <TableContainer>
        <TableHeader>
          {isRTL ? 'تفاصيل الطلبات العاجلة' : 'Immediate Requests Details'}
          {filter !== 'all' && ` - ${filter === 'tomorrow' 
            ? (isRTL ? 'غداً' : 'Tomorrow') 
            : (isRTL ? 'بعد غد' : 'Day After')
          }`}
        </TableHeader>
        <TableContent>
          {filteredRequests.map((request) => (
            <RequestRow 
              key={request.id} 
              $isRTL={isRTL} 
              $urgency={request.urgency === 'high' ? 'high' : 'medium'}
            >
              <RequestAvatar $urgency={request.urgency === 'high' ? 'high' : 'medium'}>
                {request.teacherName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </RequestAvatar>
              <RequestInfo $isRTL={isRTL}>
                <TeacherName>{request.teacherName}</TeacherName>
                <RequestDetails>
                  {request.subject} • <RequestType $type={request.requestType}>{request.requestType}</RequestType>
                </RequestDetails>
                {request.reason && (
                  <RequestDetails>
                    {isRTL ? 'السبب: ' : 'Reason: '}{request.reason}
                  </RequestDetails>
                )}
                <UrgencyBadge $urgency={request.urgency === 'high' ? 'high' : 'medium'}>
                  {request.urgency === 'high' 
                    ? (isRTL ? 'عاجل جداً' : 'High Priority')
                    : (isRTL ? 'متوسط الأولوية' : 'Medium Priority')
                  }
                </UrgencyBadge>
              </RequestInfo>
              <RequestMeta $isRTL={isRTL}>
                <TargetDate $urgency={request.urgency === 'high' ? 'high' : 'medium'}>
                  {request.targetDate}
                </TargetDate>
                <SubmittedTime>
                  {isRTL ? 'تم الإرسال: ' : 'Submitted: '}{request.submittedAt}
                </SubmittedTime>
                {request.duration && (
                  <SubmittedTime>
                    {request.duration}
                  </SubmittedTime>
                )}
              </RequestMeta>
            </RequestRow>
          ))}
        </TableContent>
      </TableContainer>
    </ChartContainer>
  );
};

export default ImmediateRequestsChart; 