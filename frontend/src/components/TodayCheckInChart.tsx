import React from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const ChartContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
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
    background: linear-gradient(90deg, #10b981, #059669);
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
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const ChartTitle = styled.h3<{ $isRTL: boolean }>`
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const DateIndicator = styled.span`
  font-size: 14px;
  color: #64748b;
  padding: 8px 16px;
  background: #f1f5f9;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid #e2e8f0;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div`
  text-align: center;
  padding: 20px 16px;
  border-radius: 12px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
  }
`;

const StatNumber = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #059669;
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
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 16px 20px;
  border-bottom: 2px solid #e2e8f0;
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
    background: #f1f5f9;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const TeacherRow = styled.div<{ $isRTL: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const TeacherAvatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981, #059669);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 16px;
  margin-right: 16px;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
`;

const TeacherInfo = styled.div<{ $isRTL: boolean }>`
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

const TeacherSubject = styled.div`
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
`;

const TimeInfo = styled.div<{ $isRTL: boolean }>`
  text-align: ${props => props.$isRTL ? 'left' : 'right'};
  min-width: 140px;
  display: flex;
  flex-direction: column;
  align-items: ${props => props.$isRTL ? 'flex-start' : 'flex-end'};
`;

const CheckInTime = styled.div`
  font-size: 14px;
  color: #059669;
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: '🕐';
    font-size: 12px;
  }
`;

const CheckOutTime = styled.div<{ $isCheckedOut: boolean }>`
  font-size: 14px;
  color: ${props => props.$isCheckedOut ? '#dc2626' : '#f59e0b'};
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &::before {
    content: ${props => props.$isCheckedOut ? "'🔴'" : "'⏳'"};
    font-size: 12px;
  }
`;

const TotalHours = styled.div`
  font-size: 12px;
  color: #64748b;
  font-weight: 500;
  margin-top: 2px;
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 6px;
  text-align: center;
`;

const StatusBadge = styled.span<{ $status: string }>`
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
  background: ${props => {
    switch (props.$status) {
      case 'checked-out': return 'linear-gradient(135deg, #fee2e2, #fecaca)';
      case 'still-in': return 'linear-gradient(135deg, #fef3c7, #fde68a)';
      default: return 'linear-gradient(135deg, #f3f4f6, #e5e7eb)';
    }
  }};
  color: ${props => {
    switch (props.$status) {
      case 'checked-out': return '#991b1b';
      case 'still-in': return '#92400e';
      default: return '#4b5563';
    }
  }};
  border: 1px solid ${props => {
    switch (props.$status) {
      case 'checked-out': return '#fca5a5';
      case 'still-in': return '#fbbf24';
      default: return '#d1d5db';
    }
  }};
  
  &::before {
    content: ${props => {
      switch (props.$status) {
        case 'checked-out': return "'✓'";
        case 'still-in': return "'⏰'";
        default: return "'•'";
      }
    }};
    font-size: 10px;
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
    content: '👥';
    font-size: 48px;
    margin-bottom: 16px;
    opacity: 0.5;
  }
`;

interface TodayCheckInData {
  totalCheckedIn: number;
  stillWorking: number;
  checkedOut: number;
  teachers: Array<{
    id: string;
    name: string;
    subject: string;
    checkInTime: string;
    checkOutTime: string | null;
    totalHours: number;
    status: 'checked-out' | 'still-in';
  }>;
  date: string;
}

interface TodayCheckInChartProps {
  data: TodayCheckInData | null;
  loading?: boolean;
  error?: string | null;
}

const TodayCheckInChart: React.FC<TodayCheckInChartProps> = ({ data, loading, error }) => {
  const { t, isRTL } = useLanguage();
  
  // Function to translate subject names for display
  const translateSubject = (subject: string): string => {
    const subjectMap: Record<string, string> = {
          'Management': t('subjects.management'),
      'Quran': t('subjects.quran'),
      'Arabic': t('subjects.arabic'),
      'Math': t('subjects.math'),
      'English': t('subjects.english'),
      'Science': t('subjects.science'),
      'Art': t('subjects.art'),
      'Programming': t('subjects.programming'),
      'Social studies': t('subjects.socialStudies'),
      'Fitness': t('subjects.fitness'),
      'Scouting': t('subjects.scouting'),
      'Nanny': t('subjects.nanny'),
      'History': t('subjects.history'),
      'Canteen': t('subjects.canteen'),
      'Floor Admin': t('subjects.floorAdmin'),
      'Sales': t('subjects.sales'),
      'HR': t('subjects.hr'),
      'Mentor': t('subjects.mentor'),
      'KG Manager': t('subjects.kgManager'),
      'Logistics': t('subjects.logistics'),
      'Assistant': t('subjects.assistant'),
      'Childcare': t('subjects.childcare'),
      'Security': t('subjects.security')
    };
    return subjectMap[subject] || subject;
  };

  if (loading) {
    return (
      <ChartContainer>
        <LoadingContainer>
          {t('loading') || 'Loading check-in data...'}
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

  if (!data || data.teachers.length === 0) {
    return (
      <ChartContainer>
        <ChartHeader $isRTL={isRTL}>
          <TitleSection $isRTL={isRTL}>
            <IconWrapper>✅</IconWrapper>
            <ChartTitle $isRTL={isRTL}>
              {isRTL ? 'حضور اليوم' : 'Today Check In'}
            </ChartTitle>
          </TitleSection>
          <DateIndicator>{data?.date || new Date().toLocaleDateString()}</DateIndicator>
        </ChartHeader>
        <EmptyState>
          {isRTL ? 'لا يوجد حضور اليوم' : 'No check-ins today'}
        </EmptyState>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartHeader $isRTL={isRTL}>
        <TitleSection $isRTL={isRTL}>
          <IconWrapper>✅</IconWrapper>
          <ChartTitle $isRTL={isRTL}>
            {isRTL ? 'حضور اليوم' : 'Today Check In'}
          </ChartTitle>
        </TitleSection>
        <DateIndicator>{data.date}</DateIndicator>
      </ChartHeader>

      <StatsContainer>
        <StatCard>
          <StatNumber>{data.totalCheckedIn}</StatNumber>
          <StatLabel>{isRTL ? 'إجمالي الحضور' : 'Total Check In'}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{data.stillWorking}</StatNumber>
          <StatLabel>{isRTL ? 'ما زال يعمل' : 'Still Working'}</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{data.checkedOut}</StatNumber>
          <StatLabel>{isRTL ? 'انصرف' : 'Checked Out'}</StatLabel>
        </StatCard>
      </StatsContainer>

      <TableContainer>
        <TableHeader>
          {isRTL ? 'تفاصيل حضور المعلمين' : 'Teacher Check-in Details'}
        </TableHeader>
        <TableContent>
          {data.teachers.filter((teacher, index, self) => 
            index === self.findIndex(t => t.id === teacher.id)
          ).map((teacher, index) => (
            <TeacherRow key={`${teacher.id}-${index}`} $isRTL={isRTL}>
              <TeacherAvatar>
                {teacher.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </TeacherAvatar>
              <TeacherInfo $isRTL={isRTL}>
                <TeacherName>{teacher.name}</TeacherName>
                <TeacherSubject>{translateSubject(teacher.subject)}</TeacherSubject>
                <StatusBadge $status={teacher.status}>
                  {teacher.status === 'checked-out' 
                    ? (isRTL ? 'انصرف' : 'Checked Out')
                    : (isRTL ? 'ما زال يعمل' : 'Still Working')
                  }
                </StatusBadge>
              </TeacherInfo>
              <TimeInfo $isRTL={isRTL}>
                <CheckInTime>{teacher.checkInTime}</CheckInTime>
                <CheckOutTime $isCheckedOut={!!teacher.checkOutTime}>
                  {teacher.checkOutTime || (isRTL ? 'ما زال يعمل' : 'Still working')}
                </CheckOutTime>
                <TotalHours>
                  {teacher.totalHours.toFixed(1)} {isRTL ? 'ساعة' : 'hrs'}
                </TotalHours>
              </TimeInfo>
            </TeacherRow>
          ))}
        </TableContent>
      </TableContainer>
    </ChartContainer>
  );
};

export default TodayCheckInChart; 
