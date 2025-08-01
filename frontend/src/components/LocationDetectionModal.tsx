import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { translations } from '../utils/translations';
import { verifyLocationInRange, formatDistance, getLocationErrorMessage, SCHOOL_LOCATION } from '../utils/locationUtils';

// Styled Components
const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 3000;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

const ModalContainer = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  width: 100%;
  height: 100%;
  background: ${props => props.isDarkMode 
    ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
    : 'linear-gradient(135deg, #DAA520 0%, #B8860B 100%)'
  };
  display: flex;
  flex-direction: column;
  direction: ${props => props.isRTL ? 'rtl' : 'ltr'};
  font-family: ${props => props.isRTL ? 'Tajawal, Cairo, sans-serif' : 'system-ui, sans-serif'};
`;

const Header = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  padding: 60px 20px 30px 20px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : 'white'};
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const HeaderText = styled.div`
  flex: 1;
`;

const Greeting = styled.h1<{ isRTL: boolean }>`
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 5px 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Subtitle = styled.p<{ isRTL: boolean; isDarkMode: boolean }>`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  text-align: ${props => props.isRTL ? 'right' : 'left'};
  color: ${props => props.isDarkMode ? '#ccc' : 'white'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const ProfileImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: url('https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face') center/cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
`;

const MainContent = styled.div<{ isDarkMode: boolean }>`
  flex: 1;
  background: ${props => props.isDarkMode ? '#121212' : '#f5f5f5'};
  border-radius: 25px 25px 0 0;
  min-height: calc(100vh - 150px);
  padding: 0;
  position: relative;
`;

const LocationCard = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  margin: 20px;
  border-radius: 20px;
  padding: 0;
  box-shadow: ${props => props.isDarkMode 
    ? '0 2px 10px rgba(0, 0, 0, 0.5)' 
    : '0 2px 10px rgba(0, 0, 0, 0.1)'
  };
  position: relative;
  border: ${props => props.isDarkMode ? '1px solid #333' : 'none'};
  overflow: hidden;
`;

const LocationHeader = styled.div<{ isRTL: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  flex-direction: ${props => props.isRTL ? 'row-reverse' : 'row'};
`;

const BackButton = styled.button<{ isDarkMode: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #DAA520;
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s;

  &:hover {
    background: #B8860B;
  }
`;

const DateTimeSection = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  text-align: center;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  padding: 20px;
`;

const DateText = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const TimeText = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  font-size: 36px;
  font-weight: 700;
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const Divider = styled.div`
  height: 2px;
  background: #DAA520;
  margin: 0 20px;
`;

const MapContainer = styled.div<{ isDarkMode: boolean }>`
  height: 300px;
  position: relative;
  background: ${props => props.isDarkMode ? '#2d2d2d' : '#e8e8e8'};
  overflow: hidden;
  margin: 20px;
  border-radius: 12px;
`;

const MapBackground = styled.div<{ isDarkMode: boolean }>`
  width: 100%;
  height: 100%;
  background: ${props => props.isDarkMode 
    ? `linear-gradient(45deg, #1a1a1a 25%, transparent 25%), 
       linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), 
       linear-gradient(45deg, transparent 75%, #1a1a1a 75%), 
       linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)`
    : `linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
       linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
       linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
       linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)`
  };
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  position: relative;
`;

const SchoolMarker = styled.div<{ isDarkMode: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 20px;
  background: #ff4444;
  border-radius: 50% 50% 50% 0;
  transform: translate(-50%, -50%) rotate(-45deg);
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 6px;
    height: 6px;
    background: white;
    border-radius: 50%;
  }
`;

const LocationRadius = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  width: 150px;
  height: 150px;
  border: 2px solid #4A90E2;
  border-radius: 50%;
  background: rgba(74, 144, 226, 0.1);
  transform: translate(-50%, -50%);
  z-index: 2;
`;

const StreetLabels = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  font-size: 12px;
  color: ${props => props.isDarkMode ? '#999' : '#666'};
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const StreetLabel = styled.div<{ top: string; left: string; rotate?: string }>`
  position: absolute;
  top: ${props => props.top};
  left: ${props => props.left};
  transform: ${props => props.rotate ? `rotate(${props.rotate})` : 'none'};
  white-space: nowrap;
  font-weight: 500;
`;

const SchoolLabel = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => props.isDarkMode ? '#f0f0f0' : '#333'};
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid ${props => props.isDarkMode ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)'};
  }
`;

const RecentlyViewedLabel = styled.div<{ isDarkMode: boolean; isRTL: boolean }>`
  position: absolute;
  top: 20px;
  left: 20px;
  color: ${props => props.isDarkMode ? '#999' : '#666'};
  font-size: 12px;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
`;

const StatusMessage = styled.div<{ isDarkMode: boolean; isRTL: boolean; type: 'success' | 'error' | 'loading' }>`
  text-align: center;
  padding: 20px;
  margin: 20px;
  border-radius: 12px;
  font-weight: 600;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};
  
  ${props => {
    if (props.type === 'success') {
      return `
        background: ${props.isDarkMode ? '#1e4f3e' : '#d4edda'};
        color: ${props.isDarkMode ? '#4ade80' : '#155724'};
        border: 1px solid ${props.isDarkMode ? '#4ade80' : '#c3e6cb'};
      `;
    } else if (props.type === 'error') {
      return `
        background: ${props.isDarkMode ? '#4f1e1e' : '#f8d7da'};
        color: ${props.isDarkMode ? '#ef4444' : '#721c24'};
        border: 1px solid ${props.isDarkMode ? '#ef4444' : '#f5c6cb'};
      `;
    } else {
      return `
        background: ${props.isDarkMode ? '#2d2d2d' : '#fff3cd'};
        color: ${props.isDarkMode ? '#fbbf24' : '#856404'};
        border: 1px solid ${props.isDarkMode ? '#fbbf24' : '#ffeaa7'};
      `;
    }
  }}
`;

const BottomNavigation = styled.div<{ isDarkMode: boolean }>`
  background: ${props => props.isDarkMode ? '#1e1e1e' : 'white'};
  padding: 16px;
  display: flex;
  justify-content: space-around;
  align-items: center;
  border-top: 1px solid ${props => props.isDarkMode ? '#333' : '#e0e0e0'};
`;

const NavItem = styled.button<{ active?: boolean; isDarkMode: boolean; isRTL: boolean }>`
  background: none;
  border: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: ${props => 
    props.active ? '#DAA520' : 
    props.isDarkMode ? '#999' : '#999'
  };
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s;
  font-family: ${props => props.isRTL ? 'Tajawal, sans-serif' : 'system-ui, sans-serif'};

  &:hover {
    background: rgba(218, 165, 32, 0.1);
  }
`;

const NavIcon = styled.div`
  font-size: 20px;
`;

const NavLabel = styled.span`
  font-size: 12px;
  font-weight: 500;
`;

// Types
interface LocationDetectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationVerified: () => void;
  teacherData: any;
}

interface LocationState {
  status: 'idle' | 'checking' | 'verified' | 'denied' | 'out-of-range' | 'error';
  message: string;
  distance?: number;
}

const LocationDetectionModal: React.FC<LocationDetectionModalProps> = ({
  isOpen,
  onClose,
  onLocationVerified,
  teacherData
}) => {
  const { language, isRTL } = useLanguage();
  const { isDarkMode } = useTheme();
  const t = translations[language];

  const [locationState, setLocationState] = useState<LocationState>({
    status: 'idle',
    message: ''
  });

  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Start location detection when modal opens
  useEffect(() => {
    if (isOpen) {
      checkLocation();
    }
  }, [isOpen]);

  // Auto-proceed when location is verified
  useEffect(() => {
    if (locationState.status === 'verified') {
      const timer = setTimeout(() => {
        onLocationVerified();
        onClose();
      }, 2000); // Wait 2 seconds to show success message

      return () => clearTimeout(timer);
    }
  }, [locationState.status, onLocationVerified, onClose]);

  const checkLocation = async () => {
    setLocationState({
      status: 'checking',
      message: t.checkingLocation
    });

    try {
      const result = await verifyLocationInRange();
      
      if (result.isInRange) {
        setLocationState({
          status: 'verified',
          message: t.locationVerified,
          distance: result.distance
        });
      } else {
        setLocationState({
          status: 'out-of-range',
          message: `${t.locationOutOfRange} (${formatDistance(result.distance, language)})`,
          distance: result.distance
        });
      }
    } catch (error) {
      console.error('Location error:', error);
      
      if (error instanceof GeolocationPositionError) {
        setLocationState({
          status: 'denied',
          message: getLocationErrorMessage(error, language)
        });
      } else {
        setLocationState({
          status: 'error',
          message: t.locationError
        });
      }
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(language === 'ar' ? 'ar-EG' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return t.formatDate(date);
  };

  return (
    <ModalOverlay isOpen={isOpen}>
      <ModalContainer isDarkMode={isDarkMode} isRTL={isRTL}>
        <Header isDarkMode={isDarkMode} isRTL={isRTL}>
          <HeaderText>
            <Greeting isRTL={isRTL}>{t.greeting(teacherData?.name || 'محمود')}</Greeting>
            <Subtitle isRTL={isRTL} isDarkMode={isDarkMode}>{t.subtitle}</Subtitle>
          </HeaderText>
          <ProfileImage />
        </Header>

        <MainContent isDarkMode={isDarkMode}>
          <LocationCard isDarkMode={isDarkMode} isRTL={isRTL}>
            <LocationHeader isRTL={isRTL}>
              <BackButton isDarkMode={isDarkMode} onClick={onClose}>
                {isRTL ? '→' : '←'}
              </BackButton>
            </LocationHeader>

            <DateTimeSection isDarkMode={isDarkMode} isRTL={isRTL}>
              <DateText isDarkMode={isDarkMode} isRTL={isRTL}>
                {formatDate(currentTime)}
              </DateText>
              <TimeText isDarkMode={isDarkMode} isRTL={isRTL}>
                {formatTime(currentTime)}
              </TimeText>
            </DateTimeSection>

            <Divider />

            <MapContainer isDarkMode={isDarkMode}>
              <MapBackground isDarkMode={isDarkMode}>
                <RecentlyViewedLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {t.recentlyViewed}
                </RecentlyViewedLabel>
                
                <StreetLabels isDarkMode={isDarkMode} isRTL={isRTL}>
                  <StreetLabel top="20%" left="10%">Street 10</StreetLabel>
                  <StreetLabel top="60%" left="15%" rotate="45deg">No.48</StreetLabel>
                  <StreetLabel top="80%" left="60%">Street 16</StreetLabel>
                  <StreetLabel top="30%" left="75%" rotate="-30deg">Mohammed Farid Axis</StreetLabel>
                </StreetLabels>

                <LocationRadius />
                <SchoolMarker isDarkMode={isDarkMode} />
                
                <SchoolLabel isDarkMode={isDarkMode} isRTL={isRTL}>
                  {SCHOOL_LOCATION.name}
                  <br />
                  <span style={{ fontSize: '12px', opacity: 0.8 }}>
                    {language === 'ar' ? 'مدرسة الفارابي للغات' : 'Farabi Language School'}
                  </span>
                </SchoolLabel>
              </MapBackground>
            </MapContainer>

            {locationState.status !== 'idle' && (
              <StatusMessage 
                isDarkMode={isDarkMode} 
                isRTL={isRTL}
                type={
                  locationState.status === 'verified' ? 'success' :
                  locationState.status === 'checking' ? 'loading' : 'error'
                }
              >
                {locationState.status === 'verified' && '✓ '}
                {locationState.message}
                {locationState.status === 'verified' && (
                  <div style={{ 
                    marginTop: '15px', 
                    fontSize: '16px', 
                    fontWeight: 'bold',
                    color: isDarkMode ? '#4ade80' : '#155724'
                  }}>
                    {language === 'ar' ? 'يمكنك الآن بدء العمل!' : 'You can now start working!'}
                  </div>
                )}
              </StatusMessage>
            )}
          </LocationCard>
        </MainContent>

        <BottomNavigation isDarkMode={isDarkMode}>
          <NavItem active isDarkMode={isDarkMode} isRTL={isRTL}>
            <NavIcon>🏠</NavIcon>
            <NavLabel>{t.home}</NavLabel>
          </NavItem>
          <NavItem isDarkMode={isDarkMode} isRTL={isRTL}>
            <NavIcon>📊</NavIcon>
            <NavLabel>{t.history}</NavLabel>
          </NavItem>
          <NavItem isDarkMode={isDarkMode} isRTL={isRTL}>
            <NavIcon>🔔</NavIcon>
            <NavLabel>{t.notifications}</NavLabel>
          </NavItem>
          <NavItem isDarkMode={isDarkMode} isRTL={isRTL}>
            <NavIcon>👤</NavIcon>
            <NavLabel>{t.profile}</NavLabel>
          </NavItem>
        </BottomNavigation>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default LocationDetectionModal; 
