import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { API_BASE_URL } from '../config/api';

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const ModalContent = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  border-radius: 20px;
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid ${props => props.isDarkMode ? '#444' : '#f0f0f0'};
  position: relative;
`;

const BackButton = styled.button<{ isRTL: boolean }>`
  background: #DAA520;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  cursor: pointer;
  margin-${props => props.isRTL ? 'left' : 'right'}: 15px;
  transform: ${props => props.isRTL ? 'rotate(180deg)' : 'none'};
  
  &:hover {
    background: #B8860B;
  }
`;

const HeaderTitle = styled.h2<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  flex: 1;
`;

const Content = styled.div`
  padding: 20px;
`;

const Table = styled.table<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
`;

const TableHeader = styled.th<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#3d3d3d' : '#F5F5DC'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  padding: 12px;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#ddd'};
  font-weight: 600;
  font-size: 14px;
`;

const TableCell = styled.td<{ isDarkMode: boolean; isRTL: boolean }>`
  padding: 12px;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  border: 1px solid ${props => props.isDarkMode ? '#555' : '#ddd'};
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 14px;
`;

const TableRow = styled.tr<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#ffffff'};
  
  &:nth-child(even) {
    background: ${props => props.isDarkMode ? '#3d3d3d' : '#f9f9f9'};
  }
  
  &:hover {
    background: ${props => props.isDarkMode ? '#404040' : '#f0f0f0'};
  }
`;

const EmptyState = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 16px;
`;

const LoadingState = styled.div<{ isDarkMode: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 16px;
`;

const FilterInfo = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#3d3d3d' : '#F5F5DC'};
  padding: 15px;
  border-radius: 10px;
  margin-bottom: 20px;
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-size: 14px;
`;

interface TeacherReport {
  id: string;
  name: string;
  workType: string;
  subject: string;
  attends: number;
  authorizedAbsence: number;
  unauthorizedAbsence: number;
  earlyLeave: number;
  lateArrival: number;
  overtime: number;
  totalHours: number;
}

interface RequestTypeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType: 'lateArrival' | 'earlyLeave' | 'authorizedAbsence' | 'unauthorizedAbsence' | 'overtime' | 'totalHours';
  subject: string;
  dateRange: { startDate: Date; endDate: Date };
}

const RequestTypeDetailModal: React.FC<RequestTypeDetailModalProps> = ({
  isOpen,
  onClose,
  requestType,
  subject,
  dateRange
}) => {
  const { t, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();

  const [data, setData] = useState<TeacherReport[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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

  // Function to translate work type
  const translateWorkType = (workType: string): string => {
    switch (workType) {
      case 'Full-time':
        return t('addTeacher.fullTime');
      case 'Part-time':
        return t('addTeacher.partTime');
      default:
        return workType;
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchDetailedData();
    }
  }, [isOpen, requestType, subject, dateRange]);

  const fetchDetailedData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (subject) {
        params.append('subject', subject);
      }
      params.append('startDate', dateRange.startDate.toISOString().split('T')[0]);
      params.append('endDate', dateRange.endDate.toISOString().split('T')[0]);

      const response = await fetch(`${API_BASE_URL}/teachers/reports?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch detailed data');
      }
      
      const result = await response.json();
      setData(result.data || []);
    } catch (err) {
      console.error('Error fetching detailed data:', err);
      setError('Failed to load detailed data');
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    switch (requestType) {
      case 'lateArrival':
        return t('reports.lateArrival');
      case 'earlyLeave':
        return t('reports.earlyLeave');
      case 'authorizedAbsence':
        return t('reports.authorizedAbsence');
      case 'unauthorizedAbsence':
        return t('reports.unauthorizedAbsence');
      case 'overtime':
        return t('reports.overtime');
      case 'totalHours':
        return t('reports.totalHours');
      default:
        return '';
    }
  };

  const getFilteredData = () => {
    return data.filter(teacher => {
      const value = teacher[requestType];
      return value > 0; // Only show teachers with non-zero values for this request type
    });
  };

  const formatDateRange = () => {
    const start = dateRange.startDate.toLocaleDateString();
    const end = dateRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  const filteredData = getFilteredData();

  if (!isOpen) return null;

  return (
    <ModalOverlay isOpen={isOpen} onClick={onClose}>
      <ModalContent
        isDarkMode={isDarkMode}
        isRTL={isRTL}
        onClick={(e) => e.stopPropagation()}
      >
        <Header isDarkMode={isDarkMode} isRTL={isRTL}>
          <BackButton isRTL={isRTL} onClick={onClose}>
            ←
          </BackButton>
          <HeaderTitle isDarkMode={isDarkMode} isRTL={isRTL}>
            {getModalTitle()}
          </HeaderTitle>
        </Header>

        <Content>
          <FilterInfo isDarkMode={isDarkMode} isRTL={isRTL}>
            <div><strong>{t('reports.dateRange')}:</strong> {formatDateRange()}</div>
            {subject && (
              <div style={{ marginTop: '5px' }}>
                <strong>{t('subjects.subject')}:</strong> {subject}
              </div>
            )}
            <div style={{ marginTop: '5px' }}>
              <strong>{t('reports.showing')}:</strong> {getModalTitle()}
            </div>
          </FilterInfo>

                     {loading ? (
             <LoadingState isDarkMode={isDarkMode}>
               {t('common.loading')}
             </LoadingState>
          ) : error ? (
            <EmptyState isDarkMode={isDarkMode} isRTL={isRTL}>
              {error}
            </EmptyState>
          ) : filteredData.length === 0 ? (
            <EmptyState isDarkMode={isDarkMode} isRTL={isRTL}>
              {isRTL ? 'لا توجد بيانات' : 'No data available'}
            </EmptyState>
          ) : (
            <Table isDarkMode={isDarkMode} isRTL={isRTL}>
              <thead>
                <tr>
                  <TableHeader isDarkMode={isDarkMode} isRTL={isRTL}>
                    {t('reports.teacher')}
                  </TableHeader>
                  <TableHeader isDarkMode={isDarkMode} isRTL={isRTL}>
                    {t('reports.workType')}
                  </TableHeader>
                  <TableHeader isDarkMode={isDarkMode} isRTL={isRTL}>
                    {t('subjects.subject')}
                  </TableHeader>
                  <TableHeader isDarkMode={isDarkMode} isRTL={isRTL}>
                    {getModalTitle()}
                  </TableHeader>
                  {requestType === 'totalHours' && (
                    <TableHeader isDarkMode={isDarkMode} isRTL={isRTL}>
                      {t('reports.overtime')}
                    </TableHeader>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((teacher) => (
                  <TableRow key={teacher.id} isDarkMode={isDarkMode}>
                    <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
                      {teacher.name}
                    </TableCell>
                    <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
                      {translateWorkType(teacher.workType)}
                    </TableCell>
                    <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
                      {translateSubject(teacher.subject)}
                    </TableCell>
                    <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
                      {requestType === 'totalHours' || requestType === 'overtime' 
                        ? teacher[requestType] 
                        : teacher[requestType]
                      }
                      {(requestType === 'totalHours' || requestType === 'overtime') && ' hrs'}
                      {(requestType === 'lateArrival' || requestType === 'earlyLeave' || 
                        requestType === 'authorizedAbsence' || requestType === 'unauthorizedAbsence') && ' days'}
                    </TableCell>
                    {requestType === 'totalHours' && (
                      <TableCell isDarkMode={isDarkMode} isRTL={isRTL}>
                        {teacher.overtime} hrs
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </tbody>
            </Table>
          )}
        </Content>
      </ModalContent>
    </ModalOverlay>
  );
};

export default RequestTypeDetailModal; 
