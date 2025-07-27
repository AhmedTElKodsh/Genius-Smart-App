import React, { useState } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';

const ChartContainer = styled.div`
  background: linear-gradient(135deg, #ffffff 0%, #fef7f0 100%);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #fed7aa;
  font-family: 'Poppins', sans-serif;
  position: relative;
  overflow: hidden;
  width: 100%;
  flex: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #f97316, #ea580c);
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
  background: linear-gradient(135deg, #f97316, #ea580c);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
`;

const ChartTitle = styled.h3<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const DateIndicator = styled.span<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #64748b;
  padding: 8px 16px;
  background: #fef7f0;
  border-radius: 20px;
  font-weight: 500;
  border: 1px solid #fed7aa;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const FilterContainer = styled.div<{ $isRTL: boolean }>`
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  flex-wrap: wrap;
`;

const FilterButton = styled.button<{ $active: boolean; $isRTL: boolean }>`
  padding: 8px 12px;
  border-radius: 20px;
  border: 2px solid ${props => props.$active ? '#f97316' : '#e2e8f0'};
  background: ${props => props.$active ? '#f97316' : '#ffffff'};
  color: ${props => props.$active ? '#ffffff' : '#64748b'};
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-weight: 600;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatCard = styled.div<{ $color: string }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  border: 2px solid ${props => props.$color};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const StatNumber = styled.div<{ $color: string; $isRTL: boolean }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.$color};
  margin-bottom: 4px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
`;

const StatLabel = styled.div<{ $isRTL: boolean }>`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TeachersList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 3px;
  }
`;

const TeacherCard = styled.div<{ $isRTL: boolean }>`
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const TeacherHeader = styled.div<{ $isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TeacherInfo = styled.div<{ $isRTL: boolean }>`
  flex: 1;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TeacherName = styled.h4<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 4px 0;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const TeacherSubject = styled.div<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 13px;
  color: #64748b;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const AbsenceType = styled.span<{ $type: 'authorized' | 'unauthorized-no-request' | 'unauthorized-rejected'; $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 11px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  color: #ffffff;
  background: ${props => {
    switch (props.$type) {
      case 'authorized': return '#22c55e';
      case 'unauthorized-no-request': return '#ef4444';
      case 'unauthorized-rejected': return '#dc2626';
      default: return '#64748b';
    }
  }};
  white-space: nowrap;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const TeacherDetails = styled.div<{ $isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ContactButton = styled.button<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  background: #3b82f6;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  
  &:hover {
    background: #2563eb;
    transform: translateY(-1px);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
  color: #64748b;
`;

const ErrorContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  font-size: 16px;
  color: #ef4444;
`;

const EmptyState = styled.div<{ $isRTL: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

// Contact Modal Styles
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
  z-index: 1000;
`;

const ModalContent = styled.div<{ $isRTL: boolean }>`
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ModalHeader = styled.div<{ $isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ModalTitle = styled.h3<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  
  &:hover {
    background: #f1f5f9;
    color: #1e293b;
  }
`;

const ContactInfo = styled.div<{ $isRTL: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ContactItem = styled.div<{ $isRTL: boolean }>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ContactIcon = styled.div`
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: #ffffff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
`;

const ContactDetails = styled.div<{ $isRTL: boolean }>`
  flex: 1;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ContactLabel = styled.div<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 2px;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const ContactValue = styled.div<{ $isRTL: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

// Data interfaces
interface AbsentTeacher {
  id: string;
  name: string;
  subject: string;
  absenceType: 'authorized' | 'unauthorized-no-request' | 'unauthorized-rejected';
  reason?: string;
  requestDate?: string;
  duration?: string;
  email?: string;
  phone?: string;
}

interface TodayAbsencesData {
  totalAbsent: number;
  authorizedAbsence: number;
  unauthorizedNoRequest: number;
  unauthorizedRejected: number;
  absentTeachers: AbsentTeacher[];
  date: string;
}

interface TodayAbsencesChartProps {
  data: TodayAbsencesData | null;
  loading?: boolean;
  error?: string | null;
}

const TodayAbsencesChart: React.FC<TodayAbsencesChartProps> = ({ data, loading, error }) => {
  const { t, isRTL } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'authorized' | 'unauthorized-no-request' | 'unauthorized-rejected'>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<AbsentTeacher | null>(null);

  if (loading) {
    return (
      <ChartContainer>
        <LoadingContainer>
          {t('loading') || 'Loading absences data...'}
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

  if (!data) {
    return (
      <ChartContainer>
        <EmptyState $isRTL={isRTL}>
          No data available
        </EmptyState>
      </ChartContainer>
    );
  }

  const filteredTeachers = data.absentTeachers.filter(teacher => {
    if (filter === 'all') return true;
    return teacher.absenceType === filter;
  });

  const getAbsenceTypeLabel = (type: string) => {
    switch (type) {
      case 'authorized':
        return t('dashboard.authorizedAbsence');
      case 'unauthorized-no-request':
        return t('dashboard.unauthorizedNoRequest');
      case 'unauthorized-rejected':
        return t('dashboard.unauthorizedRejected');
      default:
        return type;
    }
  };

  const handleContactClick = (teacher: AbsentTeacher) => {
    setSelectedTeacher(teacher);
  };

  const closeModal = () => {
    setSelectedTeacher(null);
  };

  return (
    <>
      <ChartContainer>
        <ChartHeader $isRTL={isRTL}>
          <TitleSection $isRTL={isRTL}>
            <IconWrapper>
              👥
            </IconWrapper>
            <ChartTitle $isRTL={isRTL}>
              {t('dashboard.todayAbsences')}
            </ChartTitle>
          </TitleSection>
          <DateIndicator $isRTL={isRTL}>
            {data.date}
          </DateIndicator>
        </ChartHeader>

        <StatsContainer>
          <StatCard $color="#64748b">
            <StatNumber $color="#64748b" $isRTL={isRTL}>{data.totalAbsent}</StatNumber>
            <StatLabel $isRTL={isRTL}>{t('dashboard.allMissing')}</StatLabel>
          </StatCard>
          <StatCard $color="#22c55e">
            <StatNumber $color="#22c55e" $isRTL={isRTL}>{data.authorizedAbsence}</StatNumber>
            <StatLabel $isRTL={isRTL}>{t('dashboard.authorizedAbsence')}</StatLabel>
          </StatCard>
          <StatCard $color="#ef4444">
            <StatNumber $color="#ef4444" $isRTL={isRTL}>{data.unauthorizedNoRequest}</StatNumber>
            <StatLabel $isRTL={isRTL}>{t('dashboard.unauthorizedNoRequest')}</StatLabel>
          </StatCard>
          <StatCard $color="#dc2626">
            <StatNumber $color="#dc2626" $isRTL={isRTL}>{data.unauthorizedRejected}</StatNumber>
            <StatLabel $isRTL={isRTL}>{t('dashboard.unauthorizedRejected')}</StatLabel>
          </StatCard>
        </StatsContainer>

        <FilterContainer $isRTL={isRTL}>
          <FilterButton 
            $active={filter === 'all'} 
            $isRTL={isRTL}
            onClick={() => setFilter('all')}
          >
            {t('dashboard.allMissing')}
          </FilterButton>
          <FilterButton 
            $active={filter === 'authorized'} 
            $isRTL={isRTL}
            onClick={() => setFilter('authorized')}
          >
            {t('dashboard.authorizedAbsence')}
          </FilterButton>
          <FilterButton 
            $active={filter === 'unauthorized-no-request'} 
            $isRTL={isRTL}
            onClick={() => setFilter('unauthorized-no-request')}
          >
            {t('dashboard.unauthorizedNoRequest')}
          </FilterButton>
          <FilterButton 
            $active={filter === 'unauthorized-rejected'} 
            $isRTL={isRTL}
            onClick={() => setFilter('unauthorized-rejected')}
          >
            {t('dashboard.unauthorizedRejected')}
          </FilterButton>
        </FilterContainer>

        <TeachersList>
          {filteredTeachers.length === 0 ? (
            <EmptyState $isRTL={isRTL}>
              No absent teachers in this category
            </EmptyState>
          ) : (
            filteredTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} $isRTL={isRTL}>
                <TeacherHeader $isRTL={isRTL}>
                  <TeacherInfo $isRTL={isRTL}>
                    <TeacherName $isRTL={isRTL}>{teacher.name}</TeacherName>
                    <TeacherSubject $isRTL={isRTL}>{teacher.subject}</TeacherSubject>
                  </TeacherInfo>
                  <AbsenceType $type={teacher.absenceType} $isRTL={isRTL}>
                    {getAbsenceTypeLabel(teacher.absenceType)}
                  </AbsenceType>
                </TeacherHeader>
                <TeacherDetails $isRTL={isRTL}>
                  {teacher.reason && (
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#64748b',
                      fontFamily: isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"
                    }}>
                      {teacher.reason}
                    </span>
                  )}
                  <ContactButton $isRTL={isRTL} onClick={() => handleContactClick(teacher)}>
                    {t('dashboard.contact')}
                  </ContactButton>
                </TeacherDetails>
              </TeacherCard>
            ))
          )}
        </TeachersList>
      </ChartContainer>

      {/* Contact Modal */}
      {selectedTeacher && (
        <ModalOverlay onClick={closeModal}>
          <ModalContent $isRTL={isRTL} onClick={(e) => e.stopPropagation()}>
            <ModalHeader $isRTL={isRTL}>
              <ModalTitle $isRTL={isRTL}>
                {t('dashboard.contact')} - {selectedTeacher.name}
              </ModalTitle>
              <CloseButton onClick={closeModal}>×</CloseButton>
            </ModalHeader>
            <ContactInfo $isRTL={isRTL}>
              {selectedTeacher.email && (
                <ContactItem $isRTL={isRTL}>
                  <ContactIcon>📧</ContactIcon>
                  <ContactDetails $isRTL={isRTL}>
                    <ContactLabel $isRTL={isRTL}>Email</ContactLabel>
                    <ContactValue $isRTL={isRTL}>{selectedTeacher.email}</ContactValue>
                  </ContactDetails>
                </ContactItem>
              )}
              {selectedTeacher.phone && (
                <ContactItem $isRTL={isRTL}>
                  <ContactIcon>📞</ContactIcon>
                  <ContactDetails $isRTL={isRTL}>
                    <ContactLabel $isRTL={isRTL}>Phone</ContactLabel>
                    <ContactValue $isRTL={isRTL}>{selectedTeacher.phone}</ContactValue>
                  </ContactDetails>
                </ContactItem>
              )}
              {(!selectedTeacher.email && !selectedTeacher.phone) && (
                <EmptyState $isRTL={isRTL}>
                  No contact information available
                </EmptyState>
              )}
            </ContactInfo>
          </ModalContent>
        </ModalOverlay>
      )}
    </>
  );
};

export default TodayAbsencesChart; 