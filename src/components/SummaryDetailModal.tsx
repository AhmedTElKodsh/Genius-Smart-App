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
  max-width: 400px;
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

const DayCard = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#3d3d3d' : '#F5F5DC'};
  border-radius: 15px;
  padding: 20px;
  margin-bottom: 15px;
  border-left: 4px solid #DAA520;
  position: relative;
`;

const DayDate = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const DayDetails = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 16px;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
`;

const EmptyState = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  padding: 40px 20px;
  color: ${props => props.isDarkMode ? '#cccccc' : '#666666'};
  font-size: 16px;
`;

const Pagination = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 20px;
  border-top: 1px solid ${props => props.isDarkMode ? '#444' : '#f0f0f0'};
`;

const PageInfo = styled.span<{ isDarkMode: boolean }>`
  color: ${props => props.isDarkMode ? '#ffffff' : '#333333'};
  font-size: 16px;
  font-weight: 500;
`;

const PaginationButton = styled.button<{ isDarkMode: boolean; isRTL: boolean; disabled: boolean }>`
  background: ${props => props.disabled 
    ? (props.isDarkMode ? '#333' : '#f5f5f5')
    : (props.isDarkMode ? '#555' : '#ffffff')
  };
  border: 1px solid ${props => props.disabled 
    ? (props.isDarkMode ? '#444' : '#e0e0e0')
    : (props.isDarkMode ? '#666' : '#ddd')
  };
  color: ${props => props.disabled 
    ? (props.isDarkMode ? '#666' : '#ccc')
    : (props.isDarkMode ? '#ffffff' : '#333')
  };
  padding: 8px 12px;
  border-radius: 6px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => !props.disabled && (props.isDarkMode ? '#666' : '#f0f0f0')};
  }
  
  &:active {
    transform: ${props => !props.disabled && 'scale(0.95)'};
  }
`;

interface SummaryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  data: any[];
  dateRange: { start: Date | null; end: Date | null };
  filter: string;
}

const SummaryDetailModal: React.FC<SummaryDetailModalProps> = ({
  isOpen,
  onClose,
  category,
  data,
  dateRange,
  filter
}) => {
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 4;

  // Reset to page 1 when modal opens or category changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [isOpen, category]);

  // Filter data based on category and date range
  const getFilteredData = () => {


    let filtered = data;

    // Filter by date range
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(item => {
        // Use string comparison for dates in YYYY-MM-DD format
        const itemDateStr = item.date.split('T')[0]; // Extract YYYY-MM-DD part
        const startDateStr = dateRange.start!.toISOString().split('T')[0];
        const endDateStr = dateRange.end!.toISOString().split('T')[0];
                
        const inRange = itemDateStr >= startDateStr && itemDateStr <= endDateStr;
        
        return inRange;
      });
    }

    // Filter by category
    switch (category) {
      case 'allowedAbsence':
        filtered = filtered.filter(item => 
          item.type === 'allowed_absence' || 
          (item.checkOutTime && new Date(`1970-01-01T${item.checkOutTime}`) < new Date('1970-01-01T16:00:00'))
        );
        break;
      case 'unallowedAbsence':
        filtered = filtered.filter(item => 
          item.type === 'unallowed_absence' ||
          (item.totalHours && parseFloat(item.totalHours) < 8 && !item.hasPermission)
        );
        break;
      case 'authorizedAbsence':
        filtered = filtered.filter(item => 
          item.type === 'authorized_absence' || 
          (item.status === 'approved' && item.isAbsent)
        );
        break;
      case 'unauthorizedAbsence':
        filtered = filtered.filter(item => 
          item.type === 'unauthorized_absence' ||
          (!item.checkInTime && !item.hasPermission)
        );
        break;
      case 'overtime':
        filtered = filtered.filter(item => 
          item.overtimeMinutes > 0 ||
          (item.totalHours && parseFloat(item.totalHours) > 8)
        );
        break;
      case 'lateArrival':
        filtered = filtered.filter(item => 
          item.lateMinutes > 0 ||
          (item.checkInTime && new Date(`1970-01-01T${item.checkInTime}`) > new Date('1970-01-01T08:00:00'))
        );
        break;
    }




    return filtered;
  };

  const filteredData = getFilteredData();
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayNames = t.dayNames || ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = t.monthNames || ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = dayNames[date.getDay()];
    const day = date.getDate();
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    
    if (isRTL) {
      return `${day} ${month} ${year} - ${dayName}`;
    } else {
      return `${month} ${day}, ${year} - ${dayName}`;
    }
  };

  const getCategoryTitle = () => {
    switch (category) {
          case 'allowedAbsence':
      return t.allowedAbsence || 'Allowed Absence';
    case 'unallowedAbsence':
      return t.unallowedAbsence || 'Unallowed Absence';
      case 'authorizedAbsence':
        return t.authorizedAbsence || 'Authorized Absence';
      case 'unauthorizedAbsence':
        return t.unauthorizedAbsence || 'Unauthorized Absence';
      case 'overtime':
        return t.overtime || 'Overtime';
      case 'lateArrival':
        return t.lateArrival || 'Late Arrival';
      default:
        return category;
    }
  };

  const renderDayDetails = (item: any) => {
    switch (category) {
          case 'allowedAbsence':
    case 'unallowedAbsence':
        return `${t.checkOut || 'Check out'} ${(t as any).at || 'at'} ${item.checkOutTime || '01:32 PM'}`;
      
      case 'authorizedAbsence':
        if (item.endDate && item.endDate !== item.date) {
          return `${formatDate(item.date)} - ${formatDate(item.endDate)}`;
        }
        return (t as any).noLateDays || 'No Late days';
      
      case 'unauthorizedAbsence':
        return item.reason || (isRTL ? 'غياب غير مصرح به' : 'Unauthorized absence');
      
      case 'overtime':
        const overtimeHours = Math.floor((item.overtimeMinutes || 0) / 60);
        const overtimeMins = (item.overtimeMinutes || 0) % 60;
        return `${t.overtime || 'Overtime'} ${String(overtimeHours).padStart(2, '0')}:${String(overtimeMins).padStart(2, '0')} ${(t as any).mins || 'mins'}`;
      
      case 'lateArrival':
        const lateHours = Math.floor((item.lateMinutes || 0) / 60);
        const lateMins = (item.lateMinutes || 0) % 60;
        return `${t.late || 'Late'} ${String(lateHours).padStart(2, '0')}:${String(lateMins).padStart(2, '0')} ${(t as any).mins || 'mins'}`;
      
      default:
        return '';
    }
  };

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
            {getCategoryTitle()}
          </HeaderTitle>
        </Header>

        <Content>
          {paginatedData.length === 0 ? (
            <EmptyState isDarkMode={isDarkMode} isRTL={isRTL}>
              {category === 'authorizedAbsence' ? 
                ((t as any).noLateDays || 'No Late days') : 
                (isRTL ? 'لا توجد بيانات' : 'No data available')
              }
            </EmptyState>
          ) : (
            paginatedData.map((item, index) => (
              <DayCard key={index} isDarkMode={isDarkMode}>
                <DayDate isDarkMode={isDarkMode} isRTL={isRTL}>
                  {formatDate(item.date)}
                </DayDate>
                <DayDetails isDarkMode={isDarkMode} isRTL={isRTL}>
                  {renderDayDetails(item)}
                </DayDetails>
              </DayCard>
            ))
          )}
        </Content>

        {totalPages > 1 && (
          <Pagination isDarkMode={isDarkMode} isRTL={isRTL}>
            <PaginationButton 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              isDarkMode={isDarkMode}
              isRTL={isRTL}
            >
              {isRTL ? '→' : '←'}
            </PaginationButton>
            <PageInfo isDarkMode={isDarkMode}>
              {currentPage}/{totalPages}
            </PageInfo>
            <PaginationButton 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              isDarkMode={isDarkMode}
              isRTL={isRTL}
            >
              {isRTL ? '←' : '→'}
            </PaginationButton>
          </Pagination>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default SummaryDetailModal; 