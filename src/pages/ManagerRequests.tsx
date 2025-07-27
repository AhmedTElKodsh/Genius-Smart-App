import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isThisWeek, isThisMonth, differenceInDays } from 'date-fns';
import Sidebar from '../components/Sidebar';
import AddTeacherModal from '../components/AddTeacherModal';
import { useLanguage } from '../contexts/LanguageContext';

// Styled components
const RequestsContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #E7E7E7;
`;

const MainContent = styled.main<{ $isRTL: boolean }>`
  flex: 1;
  margin-left: ${props => props.$isRTL ? '0' : '240px'};
  margin-right: ${props => props.$isRTL ? '240px' : '0'};
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  gap: 24px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 8px;
`;

const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$active ? `
    background: #D6B10E;
    color: #ffffff;
  ` : `
    background: #ffffff;
    color: #666;
    border: 1px solid #e1e7ec;
    
    &:hover {
      border-color: #D6B10E;
      color: #D6B10E;
    }
  `}
`;

const CategorySection = styled.div`
  margin-bottom: 32px;
`;

const CategoryHeader = styled.h3<{ $isDelayed?: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.$isDelayed ? '#dc3545' : '#D6B10E'};
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid ${props => props.$isDelayed ? '#dc3545' : '#D6B10E'};
  cursor: ${props => props.$isDelayed ? 'pointer' : 'default'};
  
  &:hover {
    ${props => props.$isDelayed && 'opacity: 0.8;'}
  }
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RequestItem = styled.div`
  background: #ffffff;
  border: 1px solid #e1e7ec;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #D6B10E;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const RequestRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 200px;
  align-items: center;
  gap: 24px;
  width: 100%;
  padding: 0 8px;
`;

const TeacherName = styled.div<{ $isRTL: boolean }>`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const RequestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
`;

const RequestLabel = styled.span<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 12px;
  color: #666;
  font-weight: 500;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const RequestValue = styled.span<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #141F25;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const RequestType = styled.div<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 14px;
  color: #666;
  text-align: center;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const ActionButton = styled.button<{ $type: 'accept' | 'reject' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$type === 'accept' ? `
    background: #D6B10E;
    color: #ffffff;
    
    &:hover {
      background: #c4a00d;
      transform: translateY(-1px);
    }
  ` : `
    background: #ffffff;
    color: #D6B10E;
    border: 1px solid #D6B10E;
    
    &:hover {
      background: #D6B10E;
      color: #ffffff;
      transform: translateY(-1px);
    }
  `}
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
  font-family: 'Poppins', sans-serif;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  font-family: 'Poppins', sans-serif;
  color: #666;
`;

// Modal styles
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  position: relative;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #D6B10E;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #c4a00d;
    transform: translateY(-1px);
  }
`;

const ModalTitle = styled.h2`
  font-family: 'Poppins', sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: #141F25;
  margin: 0;
`;

const ModalBody = styled.div`
  margin-bottom: 24px;
`;

const DetailRow = styled.div<{ $isRTL?: boolean }>`
  display: flex;
  margin-bottom: 16px;
  direction: ${props => props.$isRTL ? 'rtl' : 'ltr'};
  align-items: center;
`;

const DetailLabel = styled.span<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  min-width: 120px;
  margin-right: ${props => props.$isRTL ? '0' : '16px'};
  margin-left: ${props => props.$isRTL ? '16px' : '0'};
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const DetailValue = styled.span<{ $isRTL?: boolean }>`
  font-family: ${props => props.$isRTL ? "'Cairo', 'Tajawal', sans-serif" : "'Poppins', sans-serif"};
  font-size: 16px;
  color: #666;
  flex: 1;
  text-align: ${props => props.$isRTL ? 'right' : 'left'};
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
`;

const ModalButton = styled.button<{ $type: 'accept' | 'reject' }>`
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$type === 'accept' ? `
    background: #D6B10E;
    color: #ffffff;
    
    &:hover {
      background: #c4a00d;
      transform: translateY(-1px);
    }
  ` : `
    background: #ffffff;
    color: #D6B10E;
    border: 1px solid #D6B10E;
    
    &:hover {
      background: #D6B10E;
      color: #ffffff;
      transform: translateY(-1px);
    }
  `}
`;

// Types
interface Request {
  id: string;
  name: string;
  requestType: string;
  duration: string;
  appliedDate: string;
  reason: string;
  result?: string;
}

const Requests: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'absence' | 'earlyLeave' | 'late'>('all');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDelayed, setShowDelayed] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const { t, isRTL } = useLanguage();

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/manager/signin');
      return;
    }
  }, [navigate]);

  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:5000/api/requests', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const result = await response.json();
          setRequests(result.data || []);
        } else {
          console.error('Failed to fetch requests');
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  // Modal handlers
  const handleAddTeacher = () => {
    setShowAddTeacherModal(true);
  };

  const handleCloseTeacherModal = () => {
    setShowAddTeacherModal(false);
  };

  const handleTeacherAdded = () => {
    // Refresh data when a new teacher is added if needed
    console.log('Teacher added successfully');
  };

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'absence') {
      return request.requestType === 'Absence' || request.requestType === 'Authorized Absence';
    }
    if (activeTab === 'earlyLeave') return request.requestType === 'Early Leave';
    if (activeTab === 'late') return request.requestType === 'Late Arrival';
    return true; // all requests
  });

  // Categorize requests by time period
  const categorizeRequests = (requests: Request[]) => {
    const today: Request[] = [];
    const thisWeek: Request[] = [];
    const thisMonth: Request[] = [];
    const delayed: Request[] = [];

    requests.forEach(request => {
      try {
        const appliedDate = parseISO(request.appliedDate);
        const daysDifference = differenceInDays(new Date(), appliedDate);

        if (isToday(appliedDate)) {
          today.push(request);
        } else if (isThisWeek(appliedDate, { weekStartsOn: 0 })) {
          thisWeek.push(request);
        } else if (isThisMonth(appliedDate)) {
          thisMonth.push(request);
        } else if (daysDifference > 30) {
          delayed.push(request);
        } else {
          thisMonth.push(request); // Within last 30 days
        }
      } catch (error) {
        console.error('Error parsing date:', request.appliedDate, error);
        delayed.push(request); // Put invalid dates in delayed
      }
    });

    return { today, thisWeek, thisMonth, delayed };
  };

  const { today, thisWeek, thisMonth, delayed } = categorizeRequests(filteredRequests);

  // Helper function to translate request types
  const translateRequestType = (requestType: string) => {
    switch (requestType) {
      case 'Early Leave':
        return t('requestTypes.earlyLeave');
      case 'Late Arrival':
        return t('requestTypes.lateArrival');
      case 'Absence':
        return t('requestTypes.absence');
      case 'Authorized Absence':
        return t('requestTypes.authorizedAbsence');
      default:
        return requestType;
    }
  };

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
  };

  const handleRequestAction = async (action: 'accept' | 'reject', request?: Request) => {
    const targetRequest = request || selectedRequest;
    if (!targetRequest) return;

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/requests/${targetRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          result: action === 'accept' ? 'Accepted' : 'Rejected'
        }),
      });

      if (response.ok) {
        // Remove the request from the list
        setRequests(prev => prev.filter(req => req.id !== targetRequest.id));
        setSelectedRequest(null);
        console.log(`Request ${action}ed successfully:`, targetRequest.name);
        
        // Optionally show success message to user
        // You can implement a toast notification here if desired
      } else {
        const errorData = await response.json();
        console.error('Failed to update request:', errorData);
        alert(`Failed to ${action} request: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating request:', error);
      alert(`Network error: Failed to ${action} request. Please try again.`);
    }
  };

  const renderRequestsList = (requests: Request[], categoryName: string) => {
    if (requests.length === 0) return null;

    return (
      <CategorySection key={categoryName}>
        <CategoryHeader $isDelayed={categoryName === 'Delayed'}>
          {categoryName}
        </CategoryHeader>
        <RequestsList>
          {requests.map(request => (
            <RequestItem key={request.id} onClick={() => handleRequestClick(request)}>
              <RequestRow>
                <TeacherName $isRTL={isRTL}>{request.name}</TeacherName>
                
                <RequestDetails>
                  <RequestLabel $isRTL={isRTL}>{t('requests.appliedDuration')}</RequestLabel>
                  <RequestValue $isRTL={isRTL}>{request.duration}</RequestValue>
                </RequestDetails>
                
                <RequestType $isRTL={isRTL}>{translateRequestType(request.requestType)}</RequestType>
                
                <ActionButtons onClick={(e) => e.stopPropagation()}>
                  <ActionButton 
                    $type="accept"
                    onClick={() => handleRequestAction('accept', request)}
                  >
                    {t('common.accept')}
                  </ActionButton>
                  <ActionButton 
                    $type="reject"
                    onClick={() => handleRequestAction('reject', request)}
                  >
                    {t('common.reject')}
                  </ActionButton>
                </ActionButtons>
              </RequestRow>
            </RequestItem>
          ))}
        </RequestsList>
      </CategorySection>
    );
  };

  if (loading) {
    return (
      <RequestsContainer>
        <Sidebar onAddTeacher={handleAddTeacher} />
        <MainContent $isRTL={isRTL}>
          <LoadingContainer>Loading requests...</LoadingContainer>
        </MainContent>
      </RequestsContainer>
    );
  }

  return (
    <RequestsContainer>
      <Sidebar onAddTeacher={handleAddTeacher} />
      <MainContent $isRTL={isRTL}>
        <Header>
          <TabContainer>
            <Tab 
              $active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              {t('requests.allRequests')}
            </Tab>
            <Tab 
              $active={activeTab === 'absence'} 
              onClick={() => setActiveTab('absence')}
            >
              {t('requests.absenceRequests')}
            </Tab>
            <Tab 
              $active={activeTab === 'earlyLeave'} 
              onClick={() => setActiveTab('earlyLeave')}
            >
              {t('requests.earlyLeaveRequests')}
            </Tab>
            <Tab 
              $active={activeTab === 'late'} 
              onClick={() => setActiveTab('late')}
            >
              {t('requests.lateRequests')}
            </Tab>
          </TabContainer>
        </Header>

        {filteredRequests.length === 0 && (
          <EmptyState>
            <h3>{t('requests.noRequests', { type: activeTab === 'all' ? '' : activeTab })}</h3>
            <p>{t('requests.noRequestsDesc')}</p>
          </EmptyState>
        )}

        {/* Today */}
        {today.length > 0 && renderRequestsList(today, t('common.today'))}
        
        {/* This Week */}
        {thisWeek.length > 0 && renderRequestsList(thisWeek, t('common.thisWeek'))}
        
        {/* This Month */}
        {thisMonth.length > 0 && renderRequestsList(thisMonth, t('common.thisMonth'))}
        
        {/* Delayed */}
        {delayed.length > 0 && (
          <CategorySection>
            <CategoryHeader 
              $isDelayed={true}
              onClick={() => setShowDelayed(!showDelayed)}
            >
              {t('common.delayed')} ({delayed.length}) {showDelayed ? '▼' : '▶'}
            </CategoryHeader>
            {showDelayed && (
              <RequestsList>
                {delayed.map(request => (
                  <RequestItem key={request.id} onClick={() => handleRequestClick(request)}>
                    <RequestRow>
                      <TeacherName $isRTL={isRTL}>{request.name}</TeacherName>
                      
                      <RequestDetails>
                        <RequestLabel $isRTL={isRTL}>{t('requests.appliedDuration')}</RequestLabel>
                        <RequestValue $isRTL={isRTL}>{request.duration}</RequestValue>
                      </RequestDetails>
                      
                      <RequestType $isRTL={isRTL}>{translateRequestType(request.requestType)}</RequestType>
                      
                      <ActionButtons onClick={(e) => e.stopPropagation()}>
                        <ActionButton 
                          $type="accept" 
                          onClick={() => handleRequestAction('accept', request)}
                        >
                          {t('common.accept')}
                        </ActionButton>
                        <ActionButton 
                          $type="reject"
                          onClick={() => handleRequestAction('reject', request)}
                        >
                          {t('common.reject')}
                        </ActionButton>
                      </ActionButtons>
                    </RequestRow>
                  </RequestItem>
                ))}
              </RequestsList>
            )}
          </CategorySection>
        )}

        {/* Request Details Modal */}
        {selectedRequest && (
          <ModalOverlay onClick={handleCloseModal}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <BackButton onClick={handleCloseModal}>
                  ←
                </BackButton>
                <ModalTitle>Genius Smart Education</ModalTitle>
              </ModalHeader>
              
              <ModalBody>
                <DetailRow $isRTL={isRTL}>
                  <DetailLabel $isRTL={isRTL}>{t('common.name')}:</DetailLabel>
                  <DetailValue $isRTL={isRTL}>{selectedRequest.name}</DetailValue>
                </DetailRow>
                
                <DetailRow $isRTL={isRTL}>
                  <DetailLabel $isRTL={isRTL}>{t('common.type')}:</DetailLabel>
                  <DetailValue $isRTL={isRTL}>{translateRequestType(selectedRequest.requestType)}</DetailValue>
                </DetailRow>
                
                <DetailRow $isRTL={isRTL}>
                  <DetailLabel $isRTL={isRTL}>{t('common.duration')}:</DetailLabel>
                  <DetailValue $isRTL={isRTL}>{selectedRequest.duration}</DetailValue>
                </DetailRow>
                
                <DetailRow $isRTL={isRTL}>
                  <DetailLabel $isRTL={isRTL}>{t('common.date')}:</DetailLabel>
                  <DetailValue $isRTL={isRTL}>{format(parseISO(selectedRequest.appliedDate), 'dd MMMM yy')}</DetailValue>
                </DetailRow>
                
                <DetailRow $isRTL={isRTL}>
                  <DetailLabel $isRTL={isRTL}>{t('common.reason')}:</DetailLabel>
                  <DetailValue $isRTL={isRTL}>{selectedRequest.reason}</DetailValue>
                </DetailRow>
              </ModalBody>
              
              <ModalActions>
                <ModalButton $type="accept" onClick={() => handleRequestAction('accept', selectedRequest)}>
                  {t('common.accept')}
                </ModalButton>
                <ModalButton $type="reject" onClick={() => handleRequestAction('reject', selectedRequest)}>
                  {t('common.reject')}
                </ModalButton>
              </ModalActions>
            </ModalContent>
          </ModalOverlay>
        )}
      </MainContent>

      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onClose={handleCloseTeacherModal}
        onSuccess={handleTeacherAdded}
      />
    </RequestsContainer>
  );
};

export default Requests; 