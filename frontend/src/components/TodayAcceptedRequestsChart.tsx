import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const ChartContainer = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  font-family: 'Poppins', sans-serif;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const DateIndicator = styled.span`
  font-size: 14px;
  color: #666;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 6px;
`;

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div<{ $color: string }>`
  text-align: center;
  padding: 16px 12px;
  border-radius: 8px;
  background: ${props => props.$color}15;
  border: 2px solid ${props => props.$color}30;
`;

const SummaryNumber = styled.div<{ $color: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color};
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 11px;
  color: #666;
  font-weight: 500;
  line-height: 1.2;
`;

const RequestsList = styled.div`
  max-height: 280px;
  overflow-y: auto;
`;

const RequestItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
`;

const RequestTypeIcon = styled.div<{ $type: string }>`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 14px;
  background: ${props => {
    switch (props.$type) {
      case 'Early Leave': return '#fef3c7';
      case 'Late Arrival': return '#dbeafe';
      case 'Authorized Absence': return '#fde8e8';
      case 'Permitted Leaves': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'Early Leave': return '#d97706';
      case 'Late Arrival': return '#2563eb';
      case 'Authorized Absence': return '#dc2626';
      case 'Permitted Leaves': return '#059669';
      default: return '#6b7280';
    }
  }};
`;

const RequestDetails = styled.div`
  flex: 1;
`;

const TeacherName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #333;
  margin-bottom: 2px;
`;

const RequestInfo = styled.div`
  font-size: 12px;
  color: #666;
  margin-bottom: 2px;
`;

const RequestReason = styled.div`
  font-size: 11px;
  color: #888;
  font-style: italic;
`;

const RequestMeta = styled.div`
  text-align: right;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const RequestType = styled.div<{ $type: string }>`
  font-size: 10px;
  font-weight: 600;
  padding: 3px 6px;
  border-radius: 4px;
  margin-bottom: 4px;
  background: ${props => {
    switch (props.$type) {
      case 'Early Leave': return '#fef3c7';
      case 'Late Arrival': return '#dbeafe';
      case 'Authorized Absence': return '#fde8e8';
      case 'Permitted Leaves': return '#d1fae5';
      default: return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'Early Leave': return '#d97706';
      case 'Late Arrival': return '#2563eb';
      case 'Authorized Absence': return '#dc2626';
      case 'Permitted Leaves': return '#059669';
      default: return '#6b7280';
    }
  }};
`;

const ApprovedTime = styled.div`
  font-size: 10px;
  color: #22c55e;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
`;

const ErrorContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #dc3545;
  text-align: center;
`;

const NoDataContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #666;
  text-align: center;
`;

interface AcceptedRequest {
  id: string;
  teacherName: string;
  subject: string;
  requestType: string;
  reason: string;
  duration: string;
  approvedAt: string;
}

interface TodayAcceptedRequestsData {
  date: string;
  total: number;
  byType: {
    'Early Leave': number;
    'Late Arrival': number;
    'Authorized Absence': number;
    'Permitted Leaves': number;
  };
  requests: AcceptedRequest[];
}

interface TodayAcceptedRequestsChartProps {
  data: TodayAcceptedRequestsData | null;
  loading?: boolean;
  error?: string | null;
}

const TodayAcceptedRequestsChart: React.FC<TodayAcceptedRequestsChartProps> = ({ 
  data, 
  loading = false, 
  error = null 
}) => {
  const { t, isRTL } = useLanguage();

  if (loading) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>{t('dashboard.todayAcceptedRequests')}</ChartTitle>
        </ChartHeader>
        <LoadingContainer>
          {t('common.loading')}...
        </LoadingContainer>
      </ChartContainer>
    );
  }

  if (error) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>{t('dashboard.todayAcceptedRequests')}</ChartTitle>
        </ChartHeader>
        <ErrorContainer>
          {error}
        </ErrorContainer>
      </ChartContainer>
    );
  }

  if (!data || data.total === 0) {
    return (
      <ChartContainer>
        <ChartHeader>
          <ChartTitle>{t('dashboard.todayAcceptedRequests')}</ChartTitle>
          <DateIndicator>{new Date().toLocaleDateString()}</DateIndicator>
        </ChartHeader>
        <NoDataContainer>
          <div>✅</div>
          <div>{t('dashboard.noAcceptedRequestsToday')}</div>
        </NoDataContainer>
      </ChartContainer>
    );
  }

  const getRequestIcon = (type: string) => {
    switch (type) {
      case 'Early Leave': return '🏃‍♂️';
      case 'Late Arrival': return '⏰';
      case 'Authorized Absence': return '🏠';
      case 'Permitted Leaves': return '📋';
      default: return '📄';
    }
  };

  const formatApprovalTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateString;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Early Leave': return '#d97706';
      case 'Late Arrival': return '#2563eb';
      case 'Authorized Absence': return '#dc2626';
      case 'Permitted Leaves': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>{t('dashboard.todayAcceptedRequests')}</ChartTitle>
        <DateIndicator>{new Date(data.date).toLocaleDateString()}</DateIndicator>
      </ChartHeader>

      <SummaryCards>
        <SummaryCard $color={getTypeColor('Early Leave')}>
          <SummaryNumber $color={getTypeColor('Early Leave')}>
            {data.byType['Early Leave']}
          </SummaryNumber>
          <SummaryLabel>{t('requests.earlyLeave')}</SummaryLabel>
        </SummaryCard>

        <SummaryCard $color={getTypeColor('Late Arrival')}>
          <SummaryNumber $color={getTypeColor('Late Arrival')}>
            {data.byType['Late Arrival']}
          </SummaryNumber>
          <SummaryLabel>{t('requests.lateArrival')}</SummaryLabel>
        </SummaryCard>

        <SummaryCard $color={getTypeColor('Authorized Absence')}>
          <SummaryNumber $color={getTypeColor('Authorized Absence')}>
            {data.byType['Authorized Absence']}
          </SummaryNumber>
          <SummaryLabel>{t('requests.authorizedAbsence')}</SummaryLabel>
        </SummaryCard>

        <SummaryCard $color={getTypeColor('Permitted Leaves')}>
          <SummaryNumber $color={getTypeColor('Permitted Leaves')}>
            {data.byType['Permitted Leaves']}
          </SummaryNumber>
          <SummaryLabel>{t('requests.permittedLeaves')}</SummaryLabel>
        </SummaryCard>
      </SummaryCards>

      <RequestsList>
        {data.requests.map((request) => (
          <RequestItem key={request.id}>
            <RequestTypeIcon $type={request.requestType}>
              {getRequestIcon(request.requestType)}
            </RequestTypeIcon>
            
            <RequestDetails>
              <RequestInfo>{request.subject} • {request.duration}</RequestInfo>
              <RequestReason>"{request.reason}"</RequestReason>
            </RequestDetails>
            
            <RequestMeta>
              <TeacherName>{request.teacherName}</TeacherName>
              <RequestType $type={request.requestType}>
                {request.requestType}
              </RequestType>
              <ApprovedTime>
                ✓ {formatApprovalTime(request.approvedAt)}
              </ApprovedTime>
            </RequestMeta>
          </RequestItem>
        ))}
      </RequestsList>
    </ChartContainer>
  );
};

export default TodayAcceptedRequestsChart; 
