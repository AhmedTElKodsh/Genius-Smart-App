import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { format, parseISO, isToday, isThisWeek, isThisMonth, differenceInDays } from 'date-fns';
import Sidebar from '../components/Sidebar';

// Styled components
const RequestsContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: #E7E7E7;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: 240px;
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

const TeacherName = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
`;

const RequestDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  text-align: center;
`;

const RequestLabel = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 12px;
  color: #666;
  font-weight: 500;
`;

const RequestValue = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #141F25;
`;

const RequestType = styled.div`
  font-family: 'Poppins', sans-serif;
  font-size: 14px;
  color: #666;
  text-align: center;
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

const DetailRow = styled.div`
  display: flex;
  margin-bottom: 16px;
`;

const DetailLabel = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #141F25;
  min-width: 120px;
`;

const DetailValue = styled.span`
  font-family: 'Poppins', sans-serif;
  font-size: 16px;
  color: #666;
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
  const [activeTab, setActiveTab] = useState<'all' | 'absence' | 'leave'>('all');
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [showDelayed, setShowDelayed] = useState(false);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/manager-signin');
      return;
    }
  }, [navigate]);

  // Fetch requests data
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/requests');
        
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

  // Filter requests based on active tab
  const filteredRequests = requests.filter(request => {
    if (activeTab === 'absence') return request.requestType === 'Absence';
    if (activeTab === 'leave') return request.requestType === 'Early Leave';
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
      const response = await fetch(`http://localhost:5000/api/requests/${targetRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      } else {
        console.error('Failed to update request');
      }
    } catch (error) {
      console.error('Error updating request:', error);
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
                <TeacherName>{request.name}</TeacherName>
                
                <RequestDetails>
                  <RequestLabel>Applied Duration</RequestLabel>
                  <RequestValue>{request.duration}</RequestValue>
                </RequestDetails>
                
                <RequestType>{request.requestType}</RequestType>
                
                <ActionButtons onClick={(e) => e.stopPropagation()}>
                  <ActionButton 
                    $type="accept"
                    onClick={() => handleRequestAction('accept', request)}
                  >
                    Accept
                  </ActionButton>
                  <ActionButton 
                    $type="reject"
                    onClick={() => handleRequestAction('reject', request)}
                  >
                    Reject
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
        <Sidebar onAddTeacher={() => {}} />
        <MainContent>
          <LoadingContainer>Loading requests...</LoadingContainer>
        </MainContent>
      </RequestsContainer>
    );
  }

  return (
    <RequestsContainer>
      <Sidebar onAddTeacher={() => {}} />
      <MainContent>
        <Header>
          <TabContainer>
            <Tab 
              $active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              All Requests
            </Tab>
            <Tab 
              $active={activeTab === 'absence'} 
              onClick={() => setActiveTab('absence')}
            >
              Absence requests
            </Tab>
            <Tab 
              $active={activeTab === 'leave'} 
              onClick={() => setActiveTab('leave')}
            >
              Leave requests
            </Tab>
          </TabContainer>
        </Header>

        {/* Today */}
        {renderRequestsList(today, 'Today')}
        
        {/* This Week */}
        {renderRequestsList(thisWeek, 'This Week')}
        
        {/* This Month */}
        {renderRequestsList(thisMonth, 'This Month')}
        
        {/* Delayed (Collapsed) */}
        {delayed.length > 0 && (
          <CategorySection>
            <CategoryHeader 
              $isDelayed 
              onClick={() => setShowDelayed(!showDelayed)}
            >
              Delayed ({delayed.length}) {showDelayed ? '▼' : '▶'}
            </CategoryHeader>
            {showDelayed && (
              <RequestsList>
                {delayed.map(request => (
                  <RequestItem key={request.id} onClick={() => handleRequestClick(request)}>
                    <RequestRow>
                      <TeacherName>{request.name}</TeacherName>
                      
                      <RequestDetails>
                        <RequestLabel>Applied Duration</RequestLabel>
                        <RequestValue>{request.duration}</RequestValue>
                      </RequestDetails>
                      
                      <RequestType>{request.requestType}</RequestType>
                      
                      <ActionButtons onClick={(e) => e.stopPropagation()}>
                        <ActionButton 
                          $type="accept"
                          onClick={() => handleRequestAction('accept', request)}
                        >
                          Accept
                        </ActionButton>
                        <ActionButton 
                          $type="reject"
                          onClick={() => handleRequestAction('reject', request)}
                        >
                          Reject
                        </ActionButton>
                      </ActionButtons>
                    </RequestRow>
                  </RequestItem>
                ))}
              </RequestsList>
            )}
          </CategorySection>
        )}

        {/* Empty State */}
        {filteredRequests.length === 0 && (
          <EmptyState>
            <h3>No {activeTab === 'all' ? '' : activeTab} requests found</h3>
            <p>There are currently no pending requests to review.</p>
          </EmptyState>
        )}
      </MainContent>

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
              <DetailRow>
                <DetailLabel>Name:</DetailLabel>
                <DetailValue>{selectedRequest.name}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Type:</DetailLabel>
                <DetailValue>{selectedRequest.requestType}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Duration:</DetailLabel>
                <DetailValue>{selectedRequest.duration}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Date:</DetailLabel>
                <DetailValue>{format(parseISO(selectedRequest.appliedDate), 'dd MMMM yy')}</DetailValue>
              </DetailRow>
              
              <DetailRow>
                <DetailLabel>Reason:</DetailLabel>
                <DetailValue>{selectedRequest.reason}</DetailValue>
              </DetailRow>
            </ModalBody>
            
            <ModalActions>
              <ModalButton $type="accept" onClick={() => handleRequestAction('accept', selectedRequest)}>
                Accept
              </ModalButton>
              <ModalButton $type="reject" onClick={() => handleRequestAction('reject', selectedRequest)}>
                Reject
              </ModalButton>
            </ModalActions>
          </ModalContent>
        </ModalOverlay>
      )}
    </RequestsContainer>
  );
};

export default Requests; 